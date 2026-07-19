using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Returns;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Entities.Purchasing;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class PurchaseReturnService : IPurchaseReturnService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public PurchaseReturnService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<PagedResult<PurchaseReturnDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.PurchaseReturns.Include(r => r.Purchase).Include(r => r.Supplier).AsQueryable();
        query = request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(ProjectToDto()).ToListAsync(cancellationToken);
        return PagedResult<PurchaseReturnDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public async Task<PurchaseReturnDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.PurchaseReturns.Where(r => r.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("PurchaseReturn", id);

    public async Task<PurchaseReturnDto> CreateAsync(CreatePurchaseReturnRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var purchase = await _db.Purchases.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == request.PurchaseId, cancellationToken)
            ?? throw new NotFoundException("Purchase", request.PurchaseId);

        var purchaseReturn = new PurchaseReturn
        {
            TenantId = tenantId,
            ReturnNumber = await GenerateNextReturnNumberAsync(cancellationToken),
            ReturnDate = DateOnly.FromDateTime(DateTime.UtcNow),
            PurchaseId = purchase.Id,
            SupplierId = purchase.SupplierId,
            Reason = request.Reason,
            Status = ReturnStatus.Completed
        };

        decimal subtotal = 0, gst = 0;

        foreach (var itemRequest in request.Items)
        {
            var purchaseItem = purchase.Items.FirstOrDefault(pi => pi.Id == itemRequest.PurchaseItemId)
                ?? throw new NotFoundException("PurchaseItem", itemRequest.PurchaseItemId);

            var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == purchaseItem.ProductId, cancellationToken);

            if (itemRequest.Quantity > purchaseItem.Quantity)
                throw new ConflictException($"Cannot return more than the purchased quantity ({purchaseItem.Quantity}) for this line item.");
            if (product is not null && product.TrackInventory && product.CurrentStock < itemRequest.Quantity)
                throw new ConflictException($"Insufficient stock for '{product.Name}' to process this return.");

            var lineTotal = itemRequest.Quantity * purchaseItem.UnitPrice;
            var lineGst = purchaseItem.Quantity == 0 ? 0 : (purchaseItem.CgstAmount + purchaseItem.SgstAmount) * (itemRequest.Quantity / purchaseItem.Quantity);

            purchaseReturn.Items.Add(new PurchaseReturnItem
            {
                PurchaseItemId = purchaseItem.Id,
                ProductId = purchaseItem.ProductId,
                Quantity = itemRequest.Quantity,
                UnitPrice = purchaseItem.UnitPrice,
                TotalAmount = lineTotal + lineGst
            });

            subtotal += lineTotal;
            gst += lineGst;

            if (product is not null && product.TrackInventory)
            {
                product.CurrentStock -= itemRequest.Quantity;
                _db.StockLedgerEntries.Add(new StockLedgerEntry
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    WarehouseId = product.WarehouseId,
                    TransactionType = StockTransactionType.PurchaseReturn,
                    ReferenceType = "PurchaseReturn",
                    ReferenceId = purchaseReturn.Id,
                    QuantityOut = itemRequest.Quantity,
                    BalanceAfter = product.CurrentStock
                });
            }
        }

        purchaseReturn.Subtotal = subtotal;
        purchaseReturn.GstAmount = gst;
        purchaseReturn.GrandTotal = subtotal + gst;

        var supplier = await _db.Suppliers.FirstOrDefaultAsync(s => s.Id == purchase.SupplierId, cancellationToken);
        if (supplier is not null) supplier.OutstandingAmount -= purchaseReturn.GrandTotal;

        _db.PurchaseReturns.Add(purchaseReturn);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(purchaseReturn.Id, cancellationToken);
    }

    private async Task<string> GenerateNextReturnNumberAsync(CancellationToken cancellationToken)
    {
        var count = await _db.PurchaseReturns.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"PRN-{count + 1:D5}";
    }

    private static System.Linq.Expressions.Expression<Func<PurchaseReturn, PurchaseReturnDto>> ProjectToDto() => r => new PurchaseReturnDto(
        r.Id, r.ReturnNumber, r.ReturnDate, r.PurchaseId, r.Purchase.PurchaseNumber, r.SupplierId, r.Supplier.Name,
        r.Subtotal, r.GstAmount, r.GrandTotal, r.Reason, r.Status,
        r.Items.Select(i => new PurchaseReturnItemDto(i.Id, i.PurchaseItemId, i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.TotalAmount)).ToList(),
        r.CreatedAt);
}

using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Returns;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Entities.Sales;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class SalesReturnService : ISalesReturnService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public SalesReturnService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<PagedResult<SalesReturnDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.SalesReturns.Include(r => r.Invoice).Include(r => r.Customer).AsQueryable();
        query = request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(ProjectToDto()).ToListAsync(cancellationToken);
        return PagedResult<SalesReturnDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public async Task<SalesReturnDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.SalesReturns.Where(r => r.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("SalesReturn", id);

    public async Task<SalesReturnDto> CreateAsync(CreateSalesReturnRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var invoice = await _db.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken)
            ?? throw new NotFoundException("Invoice", request.InvoiceId);

        var salesReturn = new SalesReturn
        {
            TenantId = tenantId,
            ReturnNumber = await GenerateNextReturnNumberAsync(cancellationToken),
            ReturnDate = DateOnly.FromDateTime(DateTime.UtcNow),
            InvoiceId = invoice.Id,
            CustomerId = invoice.CustomerId,
            Reason = request.Reason,
            Status = ReturnStatus.Completed
        };

        decimal subtotal = 0, gst = 0;

        foreach (var itemRequest in request.Items)
        {
            var invoiceItem = invoice.Items.FirstOrDefault(ii => ii.Id == itemRequest.InvoiceItemId)
                ?? throw new NotFoundException("InvoiceItem", itemRequest.InvoiceItemId);

            if (itemRequest.Quantity > invoiceItem.Quantity)
                throw new ConflictException($"Cannot return more than the invoiced quantity ({invoiceItem.Quantity}) for this line item.");

            var lineTotal = itemRequest.Quantity * invoiceItem.UnitPrice;
            var lineGst = invoiceItem.Quantity == 0 ? 0 : (invoiceItem.CgstAmount + invoiceItem.SgstAmount) * (itemRequest.Quantity / invoiceItem.Quantity);

            salesReturn.Items.Add(new SalesReturnItem
            {
                InvoiceItemId = invoiceItem.Id,
                ProductId = invoiceItem.ProductId,
                Quantity = itemRequest.Quantity,
                UnitPrice = invoiceItem.UnitPrice,
                TotalAmount = lineTotal + lineGst
            });

            subtotal += lineTotal;
            gst += lineGst;

            var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == invoiceItem.ProductId, cancellationToken);
            if (product is not null && product.TrackInventory)
            {
                product.CurrentStock += itemRequest.Quantity;
                _db.StockLedgerEntries.Add(new StockLedgerEntry
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    WarehouseId = product.WarehouseId,
                    TransactionType = StockTransactionType.SalesReturn,
                    ReferenceType = "SalesReturn",
                    ReferenceId = salesReturn.Id,
                    QuantityIn = itemRequest.Quantity,
                    BalanceAfter = product.CurrentStock
                });
            }
        }

        salesReturn.Subtotal = subtotal;
        salesReturn.GstAmount = gst;
        salesReturn.GrandTotal = subtotal + gst;

        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == invoice.CustomerId, cancellationToken);
        if (customer is not null) customer.OutstandingAmount -= salesReturn.GrandTotal;

        _db.SalesReturns.Add(salesReturn);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(salesReturn.Id, cancellationToken);
    }

    private async Task<string> GenerateNextReturnNumberAsync(CancellationToken cancellationToken)
    {
        var count = await _db.SalesReturns.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"SRN-{count + 1:D5}";
    }

    private static System.Linq.Expressions.Expression<Func<SalesReturn, SalesReturnDto>> ProjectToDto() => r => new SalesReturnDto(
        r.Id, r.ReturnNumber, r.ReturnDate, r.InvoiceId, r.Invoice.InvoiceNumber, r.CustomerId, r.Customer.Name,
        r.Subtotal, r.GstAmount, r.GrandTotal, r.Reason, r.Status,
        r.Items.Select(i => new SalesReturnItemDto(i.Id, i.InvoiceItemId, i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.TotalAmount)).ToList(),
        r.CreatedAt);
}

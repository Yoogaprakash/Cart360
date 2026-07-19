using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Entities.Purchasing;
using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Purchases;

public class PurchaseService : IPurchaseService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly IProductRepository _productRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly IStockLedgerRepository _stockLedgerRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContext _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public PurchaseService(
        IPurchaseRepository purchaseRepository,
        IProductRepository productRepository,
        ISupplierRepository supplierRepository,
        IStockLedgerRepository stockLedgerRepository,
        ITenantRepository tenantRepository,
        ITenantContext tenantContext,
        IUnitOfWork unitOfWork)
    {
        _purchaseRepository = purchaseRepository;
        _productRepository = productRepository;
        _supplierRepository = supplierRepository;
        _stockLedgerRepository = stockLedgerRepository;
        _tenantRepository = tenantRepository;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public Task<PagedResult<PurchaseDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default) =>
        _purchaseRepository.GetPagedAsync(request, cancellationToken);

    public async Task<PurchaseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _purchaseRepository.GetDtoByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Purchase", id);

    public async Task<PurchaseDto> CreateAsync(CreatePurchaseRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var supplier = await _supplierRepository.GetEntityByIdAsync(request.SupplierId, cancellationToken)
            ?? throw new NotFoundException("Supplier", request.SupplierId);

        var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Tenant not found for the current request.");

        var purchase = new Purchase
        {
            TenantId = tenantId,
            PurchaseNumber = await _purchaseRepository.GenerateNextPurchaseNumberAsync(tenant.PurchasePrefix, cancellationToken),
            PurchaseDate = request.PurchaseDate,
            SupplierId = supplier.Id,
            ReferenceBillNumber = request.ReferenceBillNumber,
            Status = PurchaseStatus.Received,
            Notes = request.Notes
        };

        decimal subtotal = 0, cgstTotal = 0, sgstTotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _productRepository.GetEntityByIdAsync(itemRequest.ProductId, cancellationToken)
                ?? throw new NotFoundException("Product", itemRequest.ProductId);

            var lineSubtotal = itemRequest.Quantity * itemRequest.UnitPrice;
            var lineDiscount = Math.Round(lineSubtotal * itemRequest.DiscountPercent / 100m, 2, MidpointRounding.AwayFromZero);
            var taxable = lineSubtotal - lineDiscount;

            var cgst = tenant.IsGstEnabled ? Math.Round(taxable * product.CgstPercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var sgst = tenant.IsGstEnabled ? Math.Round(taxable * product.SgstPercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var lineTotal = taxable + cgst + sgst;

            purchase.Items.Add(new PurchaseItem
            {
                ProductId = product.Id,
                Quantity = itemRequest.Quantity,
                UnitPrice = itemRequest.UnitPrice,
                DiscountPercent = itemRequest.DiscountPercent,
                GstPercent = tenant.IsGstEnabled ? product.GstPercent : 0m,
                CgstAmount = cgst,
                SgstAmount = sgst,
                IgstAmount = 0,
                TotalAmount = lineTotal
            });

            subtotal += lineSubtotal;
            cgstTotal += cgst;
            sgstTotal += sgst;

            if (product.TrackInventory)
            {
                product.CurrentStock += itemRequest.Quantity;
                await _stockLedgerRepository.AddEntryAsync(new StockLedgerEntry
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    WarehouseId = product.WarehouseId,
                    TransactionType = StockTransactionType.Purchase,
                    ReferenceType = "Purchase",
                    ReferenceId = purchase.Id,
                    QuantityIn = itemRequest.Quantity,
                    BalanceAfter = product.CurrentStock,
                    UnitCost = itemRequest.UnitPrice
                }, cancellationToken);
            }
        }

        var rawTotal = subtotal + cgstTotal + sgstTotal;
        var grandTotal = Math.Round(rawTotal, 0, MidpointRounding.AwayFromZero);

        purchase.Subtotal = subtotal;
        purchase.CgstAmount = cgstTotal;
        purchase.SgstAmount = sgstTotal;
        purchase.RoundOff = grandTotal - rawTotal;
        purchase.GrandTotal = grandTotal;
        purchase.PaidAmount = Math.Min(request.PaidAmount, grandTotal);
        purchase.BalanceAmount = grandTotal - purchase.PaidAmount;

        supplier.OutstandingAmount += purchase.BalanceAmount;

        await _purchaseRepository.AddAsync(purchase, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _purchaseRepository.GetDtoByIdAsync(purchase.Id, cancellationToken))!;
    }

    public async Task<PurchaseDto> RecordPaymentAsync(Guid id, RecordPurchasePaymentRequest request, CancellationToken cancellationToken = default)
    {
        var purchase = await _purchaseRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Purchase", id);

        if (purchase.Status == PurchaseStatus.Cancelled)
            throw new ConflictException("Cannot record a payment against a cancelled purchase.");

        var amount = Math.Min(request.Amount, purchase.BalanceAmount);
        purchase.PaidAmount += amount;
        purchase.BalanceAmount -= amount;

        var supplier = await _supplierRepository.GetEntityByIdAsync(purchase.SupplierId, cancellationToken);
        if (supplier is not null) supplier.OutstandingAmount -= amount;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _purchaseRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task<PurchaseDto> CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var purchase = await _purchaseRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Purchase", id);

        if (purchase.Status == PurchaseStatus.Cancelled)
            return (await _purchaseRepository.GetDtoByIdAsync(id, cancellationToken))!;

        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        foreach (var item in purchase.Items)
        {
            var product = await _productRepository.GetEntityByIdAsync(item.ProductId, cancellationToken);
            if (product is null || !product.TrackInventory) continue;

            if (product.CurrentStock < item.Quantity)
                throw new ConflictException($"Cannot cancel: '{product.Name}' stock has already moved below the purchased quantity.");

            product.CurrentStock -= item.Quantity;
            await _stockLedgerRepository.AddEntryAsync(new StockLedgerEntry
            {
                TenantId = tenantId,
                ProductId = product.Id,
                WarehouseId = product.WarehouseId,
                TransactionType = StockTransactionType.Adjustment,
                ReferenceType = "PurchaseCancellation",
                ReferenceId = purchase.Id,
                QuantityOut = item.Quantity,
                BalanceAfter = product.CurrentStock,
                Notes = $"Reversed on cancellation of purchase {purchase.PurchaseNumber}"
            }, cancellationToken);
        }

        var supplier = await _supplierRepository.GetEntityByIdAsync(purchase.SupplierId, cancellationToken);
        if (supplier is not null) supplier.OutstandingAmount -= purchase.BalanceAmount;

        purchase.Status = PurchaseStatus.Cancelled;
        purchase.BalanceAmount = 0;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _purchaseRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }
}

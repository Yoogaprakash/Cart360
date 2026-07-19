using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Entities.Sales;
using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Invoices;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IStockLedgerRepository _stockLedgerRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionLimitService _limitService;
    private readonly ITenantContext _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        IProductRepository productRepository,
        ICustomerRepository customerRepository,
        IStockLedgerRepository stockLedgerRepository,
        ITenantRepository tenantRepository,
        ISubscriptionLimitService limitService,
        ITenantContext tenantContext,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
        _customerRepository = customerRepository;
        _stockLedgerRepository = stockLedgerRepository;
        _tenantRepository = tenantRepository;
        _limitService = limitService;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public Task<PagedResult<InvoiceDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default) =>
        _invoiceRepository.GetPagedAsync(request, cancellationToken);

    public async Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _invoiceRepository.GetDtoByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Invoice", id);

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.MonthlyInvoices, 1, cancellationToken);

        var customer = await _customerRepository.GetEntityByIdAsync(request.CustomerId, cancellationToken)
            ?? throw new NotFoundException("Customer", request.CustomerId);

        var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Tenant not found for the current request.");

        var invoice = new Invoice
        {
            TenantId = tenantId,
            InvoiceNumber = await _invoiceRepository.GenerateNextInvoiceNumberAsync(tenant.InvoicePrefix, cancellationToken),
            InvoiceDate = request.InvoiceDate,
            DueDate = request.DueDate,
            CustomerId = customer.Id,
            PaymentMethod = request.PaymentMethod
        };

        decimal subtotal = 0, discountTotal = 0, cgstTotal = 0, sgstTotal = 0;

        // NOTE: assumes intra-state supply (CGST + SGST) throughout — inter-state IGST
        // (place-of-supply vs. company state) is not yet modeled; every product's
        // IgstPercent is stored for when that logic is added, but unused here.
        foreach (var itemRequest in request.Items)
        {
            var product = await _productRepository.GetEntityByIdAsync(itemRequest.ProductId, cancellationToken)
                ?? throw new NotFoundException("Product", itemRequest.ProductId);

            if (product.TrackInventory && product.CurrentStock < itemRequest.Quantity)
                throw new ConflictException($"Insufficient stock for '{product.Name}'. Available: {product.CurrentStock}, requested: {itemRequest.Quantity}.");

            var unitPrice = itemRequest.UnitPrice ?? product.SellingPrice;
            var lineSubtotal = itemRequest.Quantity * unitPrice;
            var lineDiscount = Math.Round(lineSubtotal * itemRequest.DiscountPercent / 100m, 2, MidpointRounding.AwayFromZero);
            var taxable = lineSubtotal - lineDiscount;

            // Company-level master switch: GST-disabled companies bill at zero tax
            // regardless of each product's own GST%/CGST%/SGST% — see Tenant.IsGstEnabled.
            var cgst = tenant.IsGstEnabled ? Math.Round(taxable * product.CgstPercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var sgst = tenant.IsGstEnabled ? Math.Round(taxable * product.SgstPercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var lineTotal = taxable + cgst + sgst;

            invoice.Items.Add(new InvoiceItem
            {
                ProductId = product.Id,
                Quantity = itemRequest.Quantity,
                UnitPrice = unitPrice,
                DiscountPercent = itemRequest.DiscountPercent,
                DiscountAmount = lineDiscount,
                GstPercent = tenant.IsGstEnabled ? product.GstPercent : 0m,
                CgstAmount = cgst,
                SgstAmount = sgst,
                IgstAmount = 0,
                TotalAmount = lineTotal
            });

            subtotal += lineSubtotal;
            discountTotal += lineDiscount;
            cgstTotal += cgst;
            sgstTotal += sgst;

            if (product.TrackInventory)
            {
                product.CurrentStock -= itemRequest.Quantity;
                await _stockLedgerRepository.AddEntryAsync(new StockLedgerEntry
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    WarehouseId = product.WarehouseId,
                    TransactionType = StockTransactionType.Sale,
                    ReferenceType = "Invoice",
                    ReferenceId = invoice.Id,
                    QuantityOut = itemRequest.Quantity,
                    BalanceAfter = product.CurrentStock,
                    UnitCost = product.PurchasePrice
                }, cancellationToken);
            }
        }

        var rawTotal = subtotal - discountTotal + cgstTotal + sgstTotal;
        var grandTotal = Math.Round(rawTotal, 0, MidpointRounding.AwayFromZero);

        invoice.Subtotal = subtotal;
        invoice.DiscountAmount = discountTotal;
        invoice.CgstAmount = cgstTotal;
        invoice.SgstAmount = sgstTotal;
        invoice.RoundOff = grandTotal - rawTotal;
        invoice.GrandTotal = grandTotal;
        invoice.PaidAmount = Math.Min(request.PaidAmount, grandTotal);
        invoice.BalanceAmount = grandTotal - invoice.PaidAmount;
        invoice.Status = invoice.BalanceAmount <= 0 ? InvoiceStatus.Paid
            : invoice.PaidAmount > 0 ? InvoiceStatus.PartiallyPaid
            : InvoiceStatus.Pending;
        invoice.Notes = request.Notes;
        invoice.Terms = request.Terms;

        customer.OutstandingAmount += invoice.BalanceAmount;

        await _invoiceRepository.AddAsync(invoice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _invoiceRepository.GetDtoByIdAsync(invoice.Id, cancellationToken))!;
    }

    public async Task<InvoiceDto> RecordPaymentAsync(Guid id, RecordInvoicePaymentRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Invoice", id);

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new ConflictException("Cannot record a payment against a cancelled invoice.");

        var amount = Math.Min(request.Amount, invoice.BalanceAmount);
        invoice.PaidAmount += amount;
        invoice.BalanceAmount -= amount;
        invoice.Status = invoice.BalanceAmount <= 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;

        var customer = await _customerRepository.GetEntityByIdAsync(invoice.CustomerId, cancellationToken);
        if (customer is not null) customer.OutstandingAmount -= amount;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _invoiceRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task<InvoiceDto> CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Invoice", id);

        if (invoice.Status == InvoiceStatus.Cancelled)
            return (await _invoiceRepository.GetDtoByIdAsync(id, cancellationToken))!;

        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        foreach (var item in invoice.Items)
        {
            var product = await _productRepository.GetEntityByIdAsync(item.ProductId, cancellationToken);
            if (product is null || !product.TrackInventory) continue;

            product.CurrentStock += item.Quantity;
            await _stockLedgerRepository.AddEntryAsync(new StockLedgerEntry
            {
                TenantId = tenantId,
                ProductId = product.Id,
                WarehouseId = product.WarehouseId,
                TransactionType = StockTransactionType.Adjustment,
                ReferenceType = "InvoiceCancellation",
                ReferenceId = invoice.Id,
                QuantityIn = item.Quantity,
                BalanceAfter = product.CurrentStock,
                Notes = $"Reversed on cancellation of invoice {invoice.InvoiceNumber}"
            }, cancellationToken);
        }

        var customer = await _customerRepository.GetEntityByIdAsync(invoice.CustomerId, cancellationToken);
        if (customer is not null) customer.OutstandingAmount -= invoice.BalanceAmount;

        invoice.Status = InvoiceStatus.Cancelled;
        invoice.BalanceAmount = 0;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _invoiceRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task<InvoiceDto> IncrementPrintCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var invoice = await _invoiceRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Invoice", id);

        invoice.PrintCount += 1;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _invoiceRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }
}

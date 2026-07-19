using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Invoices;
using Cart360.Domain.Entities.Sales;
using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Quotations;

public class QuotationService : IQuotationService
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionLimitService _limitService;
    private readonly IInvoiceService _invoiceService;
    private readonly ITenantContext _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public QuotationService(
        IQuotationRepository quotationRepository,
        IProductRepository productRepository,
        ICustomerRepository customerRepository,
        ITenantRepository tenantRepository,
        ISubscriptionLimitService limitService,
        IInvoiceService invoiceService,
        ITenantContext tenantContext,
        IUnitOfWork unitOfWork)
    {
        _quotationRepository = quotationRepository;
        _productRepository = productRepository;
        _customerRepository = customerRepository;
        _tenantRepository = tenantRepository;
        _limitService = limitService;
        _invoiceService = invoiceService;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public Task<PagedResult<QuotationDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default) =>
        _quotationRepository.GetPagedAsync(request, cancellationToken);

    public async Task<QuotationDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _quotationRepository.GetDtoByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Quotation", id);

    public async Task<QuotationDto> CreateAsync(CreateQuotationRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();
        await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.MonthlyQuotations, 1, cancellationToken);

        var customer = await _customerRepository.GetEntityByIdAsync(request.CustomerId, cancellationToken)
            ?? throw new NotFoundException("Customer", request.CustomerId);

        var tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Tenant not found for the current request.");

        var quotation = new Quotation
        {
            TenantId = tenantId,
            QuotationNumber = await _quotationRepository.GenerateNextQuotationNumberAsync(tenant.QuotationPrefix, cancellationToken),
            QuotationDate = request.QuotationDate,
            ExpiryDate = request.ExpiryDate,
            CustomerId = customer.Id,
            Status = QuotationStatus.Draft,
            Notes = request.Notes,
            Terms = request.Terms
        };

        decimal subtotal = 0, cgstTotal = 0, sgstTotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _productRepository.GetEntityByIdAsync(itemRequest.ProductId, cancellationToken)
                ?? throw new NotFoundException("Product", itemRequest.ProductId);

            var unitPrice = itemRequest.UnitPrice ?? product.SellingPrice;
            var lineSubtotal = itemRequest.Quantity * unitPrice;
            var lineDiscount = Math.Round(lineSubtotal * itemRequest.DiscountPercent / 100m, 2, MidpointRounding.AwayFromZero);
            var taxable = lineSubtotal - lineDiscount;

            var cgst = tenant.IsGstEnabled ? Math.Round(taxable * product.CgstPercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var sgst = tenant.IsGstEnabled ? Math.Round(taxable * product.SgstPercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m;

            quotation.Items.Add(new QuotationItem
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
                TotalAmount = taxable + cgst + sgst
            });

            subtotal += lineSubtotal;
            cgstTotal += cgst;
            sgstTotal += sgst;
        }

        var rawTotal = subtotal + cgstTotal + sgstTotal;
        var grandTotal = Math.Round(rawTotal, 0, MidpointRounding.AwayFromZero);

        quotation.Subtotal = subtotal;
        quotation.CgstAmount = cgstTotal;
        quotation.SgstAmount = sgstTotal;
        quotation.RoundOff = grandTotal - rawTotal;
        quotation.GrandTotal = grandTotal;

        await _quotationRepository.AddAsync(quotation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _quotationRepository.GetDtoByIdAsync(quotation.Id, cancellationToken))!;
    }

    public async Task<QuotationDto> UpdateStatusAsync(Guid id, UpdateQuotationStatusRequest request, CancellationToken cancellationToken = default)
    {
        var quotation = await _quotationRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Quotation", id);

        if (quotation.Status == QuotationStatus.Converted)
            throw new ConflictException("A converted quotation's status can no longer be changed.");

        if (request.Status == QuotationStatus.Converted)
            throw new ConflictException("Use the convert-to-invoice action to convert a quotation.");

        quotation.Status = request.Status;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _quotationRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task<InvoiceDto> ConvertToInvoiceAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var quotation = await _quotationRepository.GetEntityWithItemsByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Quotation", id);

        if (quotation.Status == QuotationStatus.Converted)
            throw new ConflictException("This quotation has already been converted to an invoice.");
        if (quotation.Status == QuotationStatus.Rejected || quotation.Status == QuotationStatus.Expired)
            throw new ConflictException($"A {quotation.Status} quotation cannot be converted.");

        // Delegates to the exact same invoice-creation path a manually-entered invoice would
        // take, so stock deduction / subscription limits / GST rules never drift between the
        // two entry points — the quotation is just a pre-filled invoice at this point.
        var invoiceRequest = new CreateInvoiceRequest(
            quotation.CustomerId,
            DateOnly.FromDateTime(DateTime.UtcNow),
            null,
            InvoicePaymentMethod.Cash,
            0,
            quotation.Notes,
            quotation.Terms,
            quotation.Items.Select(i => new CreateInvoiceItemRequest(i.ProductId, i.Quantity, i.UnitPrice, i.DiscountPercent)).ToList());

        var invoice = await _invoiceService.CreateAsync(invoiceRequest, cancellationToken);

        quotation.Status = QuotationStatus.Converted;
        quotation.ConvertedInvoiceId = invoice.Id;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice;
    }
}

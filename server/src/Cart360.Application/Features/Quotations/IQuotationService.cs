using Cart360.Application.Common.Models;
using Cart360.Application.Features.Invoices;

namespace Cart360.Application.Features.Quotations;

public interface IQuotationService
{
    Task<PagedResult<QuotationDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<QuotationDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<QuotationDto> CreateAsync(CreateQuotationRequest request, CancellationToken cancellationToken = default);
    Task<QuotationDto> UpdateStatusAsync(Guid id, UpdateQuotationStatusRequest request, CancellationToken cancellationToken = default);

    /// <summary>Copies this quotation's line items into a brand-new Invoice (applying current stock/GST rules exactly as a fresh invoice would) and marks the quotation Converted.</summary>
    Task<InvoiceDto> ConvertToInvoiceAsync(Guid id, CancellationToken cancellationToken = default);
}

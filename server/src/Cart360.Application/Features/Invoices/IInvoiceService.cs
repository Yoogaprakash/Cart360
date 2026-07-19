using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Invoices;

public interface IInvoiceService
{
    Task<PagedResult<InvoiceDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<InvoiceDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InvoiceDto> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default);
    Task<InvoiceDto> RecordPaymentAsync(Guid id, RecordInvoicePaymentRequest request, CancellationToken cancellationToken = default);
    Task<InvoiceDto> CancelAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InvoiceDto> IncrementPrintCountAsync(Guid id, CancellationToken cancellationToken = default);
}

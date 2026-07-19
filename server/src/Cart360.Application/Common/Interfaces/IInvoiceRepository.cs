using Cart360.Application.Common.Models;
using Cart360.Application.Features.Invoices;
using Cart360.Domain.Entities.Sales;

namespace Cart360.Application.Common.Interfaces;

public interface IInvoiceRepository
{
    Task<PagedResult<InvoiceDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<InvoiceDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Invoice?> GetEntityWithItemsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextInvoiceNumberAsync(string prefix, CancellationToken cancellationToken = default);
    Task AddAsync(Invoice invoice, CancellationToken cancellationToken = default);
}

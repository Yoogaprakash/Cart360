using Cart360.Application.Common.Models;
using Cart360.Application.Features.Quotations;
using Cart360.Domain.Entities.Sales;

namespace Cart360.Application.Common.Interfaces;

public interface IQuotationRepository
{
    Task<PagedResult<QuotationDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<QuotationDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Quotation?> GetEntityWithItemsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextQuotationNumberAsync(string prefix, CancellationToken cancellationToken = default);
    Task AddAsync(Quotation quotation, CancellationToken cancellationToken = default);
}

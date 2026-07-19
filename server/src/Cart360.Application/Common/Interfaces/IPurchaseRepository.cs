using Cart360.Application.Common.Models;
using Cart360.Application.Features.Purchases;
using Cart360.Domain.Entities.Purchasing;

namespace Cart360.Application.Common.Interfaces;

public interface IPurchaseRepository
{
    Task<PagedResult<PurchaseDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Purchase?> GetEntityWithItemsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextPurchaseNumberAsync(string prefix, CancellationToken cancellationToken = default);
    Task AddAsync(Purchase purchase, CancellationToken cancellationToken = default);
}

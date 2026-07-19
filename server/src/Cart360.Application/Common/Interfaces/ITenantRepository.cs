using Cart360.Domain.Entities.Platform;

namespace Cart360.Application.Common.Interfaces;

public interface ITenantRepository
{
    Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken = default);
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);
}

using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Platform;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly Cart360DbContext _db;

    public TenantRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken = default) =>
        _db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Slug == slug, cancellationToken);

    public Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);

    public async Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default) =>
        await _db.Tenants.AddAsync(tenant, cancellationToken);
}

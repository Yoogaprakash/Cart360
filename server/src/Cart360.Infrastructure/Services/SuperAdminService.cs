using Cart360.Application.Features.SuperAdmin;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class SuperAdminService : ISuperAdminService
{
    private readonly Cart360DbContext _db;

    public SuperAdminService(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<SuperAdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var tenants = _db.Tenants.IgnoreQueryFilters().Where(t => !t.IsDeleted);

        var totalCompanies = await tenants.CountAsync(cancellationToken);
        var activeCompanies = await tenants.CountAsync(t => t.Status == TenantStatus.Active, cancellationToken);
        var pendingCompanies = await tenants.CountAsync(t => t.Status == TenantStatus.Pending, cancellationToken);
        var suspendedCompanies = await tenants.CountAsync(t => t.Status == TenantStatus.Suspended, cancellationToken);

        // Cross-tenant read — deliberate use of IgnoreQueryFilters, the documented escape
        // hatch for Super Admin aggregate views (see Cart360DbContext.ApplyGlobalQueryFilters).
        var totalUsers = await _db.Users.IgnoreQueryFilters().CountAsync(u => !u.IsDeleted && u.TenantId != null, cancellationToken);

        var mrr = await _db.TenantSubscriptions.IgnoreQueryFilters()
            .Where(s => s.Status == SubscriptionStatus.Active && s.BillingCycle == BillingCycle.Monthly)
            .SumAsync(s => s.PriceAtPurchase, cancellationToken);

        var twelveMonthsAgo = DateTimeOffset.UtcNow.AddMonths(-11);
        // EF Core can't translate a record constructor inside a GroupBy().Select() — project into
        // an anonymous type first (which it can translate to SQL) and materialize the record in memory.
        var growth = await tenants
            .Where(t => t.CreatedAt >= twelveMonthsAgo)
            .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .OrderBy(r => r.Year).ThenBy(r => r.Month)
            .ToListAsync(cancellationToken);

        var growthRows = growth.Select(g => new MonthlyGrowthRow(g.Year, g.Month, g.Count)).ToList();

        return new SuperAdminDashboardDto(totalCompanies, activeCompanies, pendingCompanies, suspendedCompanies, totalUsers, mrr, growthRows);
    }
}

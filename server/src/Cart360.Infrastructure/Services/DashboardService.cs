using Cart360.Application.Common.Interfaces;
using Cart360.Application.Features.Dashboard;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly Cart360DbContext _db;
    private readonly ISubscriptionLimitService _limitService;

    public DashboardService(Cart360DbContext db, ISubscriptionLimitService limitService)
    {
        _db = db;
        _limitService = limitService;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var totalProducts = await _db.Products.CountAsync(cancellationToken);
        var lowStockProducts = await _db.Products
            .CountAsync(p => p.TrackInventory && p.CurrentStock <= p.MinStockLevel, cancellationToken);
        var totalUnits = await _db.Units.CountAsync(cancellationToken);

        var trackedLimits = new[]
        {
            SubscriptionLimitType.Users,
            SubscriptionLimitType.Products,
            SubscriptionLimitType.Customers,
            SubscriptionLimitType.MonthlyInvoices
        };

        var usage = new List<UsageMeterDto>();
        foreach (var limitType in trackedLimits)
        {
            var result = await _limitService.GetUsageAsync(tenantId, limitType, cancellationToken);
            usage.Add(new UsageMeterDto(limitType.ToString(), result.Current, result.Max));
        }

        return new DashboardSummaryDto(totalProducts, lowStockProducts, totalUnits, usage);
    }
}

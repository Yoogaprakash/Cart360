namespace Cart360.Application.Features.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

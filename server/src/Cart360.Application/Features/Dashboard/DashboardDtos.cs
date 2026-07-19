namespace Cart360.Application.Features.Dashboard;

public record UsageMeterDto(string LimitType, int Current, int Max);

public record DashboardSummaryDto(
    int TotalProducts,
    int LowStockProducts,
    int TotalUnits,
    IReadOnlyCollection<UsageMeterDto> PlanUsage);

namespace Cart360.Application.Features.SuperAdmin;

public interface ISuperAdminService
{
    Task<SuperAdminDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default);
}

public interface ISubscriptionPlanAdminService
{
    Task<IReadOnlyList<SubscriptionPlanDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SubscriptionPlanDto> CreateAsync(UpsertSubscriptionPlanRequest request, CancellationToken cancellationToken = default);
    Task<SubscriptionPlanDto> UpdateAsync(Guid id, UpsertSubscriptionPlanRequest request, CancellationToken cancellationToken = default);
}

using Cart360.Domain.Entities.Platform;

namespace Cart360.Application.Common.Interfaces;

public interface ISubscriptionPlanRepository
{
    Task<SubscriptionPlan?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

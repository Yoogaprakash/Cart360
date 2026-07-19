using Cart360.Domain.Enums;

namespace Cart360.Application.Common.Interfaces;

public record SubscriptionUsageDto(SubscriptionLimitType LimitType, int Current, int Max, bool IsUnlimited);

public interface ISubscriptionLimitService
{
    /// <summary>Throws <see cref="Cart360.Application.Common.Exceptions.SubscriptionLimitExceededException"/> if the tenant is already at/over its plan's cap for <paramref name="limitType"/>; otherwise no-ops. Call before persisting the resource that would push usage over the cap.</summary>
    Task EnsureCanAddAsync(Guid tenantId, SubscriptionLimitType limitType, int quantity = 1, CancellationToken cancellationToken = default);

    Task<SubscriptionUsageDto> GetUsageAsync(Guid tenantId, SubscriptionLimitType limitType, CancellationToken cancellationToken = default);

    Task<bool> HasFeatureAsync(Guid tenantId, string featureFlag, CancellationToken cancellationToken = default);
}

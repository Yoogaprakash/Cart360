using Cart360.Domain.Common;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Platform;

/// <summary>The subscription "instance" binding a Tenant to a SubscriptionPlan for a billing period.</summary>
public class TenantSubscription : BaseEntity
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = default!;

    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = default!;

    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    public bool AutoRenew { get; set; } = true;
    public decimal PriceAtPurchase { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

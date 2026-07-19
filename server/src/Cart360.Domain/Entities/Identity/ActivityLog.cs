using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Identity;

/// <summary>Tenant-visible "who did what" feed (distinct from the Super-Admin-only <see cref="Cart360.Domain.Entities.Platform.PlatformAuditLog"/>).</summary>
public class ActivityLog : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string Module { get; set; } = default!;
    public string Action { get; set; } = default!;
    public string? Description { get; set; }
    public Guid? EntityId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

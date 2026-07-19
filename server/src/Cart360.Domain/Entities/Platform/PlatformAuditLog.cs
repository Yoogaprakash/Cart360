using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Platform;

/// <summary>
/// Before/after audit trail for sensitive mutations, visible to the Super Admin
/// across every tenant. Distinct from the tenant-scoped <see cref="Cart360.Domain.Entities.Identity.ActivityLog"/>,
/// which is a lighter-weight, tenant-visible activity feed.
/// </summary>
public class PlatformAuditLog : BaseEntity
{
    public Guid? TenantId { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = default!;
    public string EntityName { get; set; } = default!;
    public Guid? EntityId { get; set; }
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

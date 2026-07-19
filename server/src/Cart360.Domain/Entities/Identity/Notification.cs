using Cart360.Domain.Common;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Identity;

/// <summary>An in-app notification. <see cref="UserId"/> null means it is broadcast to the whole tenant.</summary>
public class Notification : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? LinkUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

using Cart360.Domain.Common;
using Cart360.Domain.Entities.Platform;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Identity;

/// <summary>
/// A login-capable account. <see cref="TenantId"/> is null only for
/// <see cref="UserRole.SuperAdmin"/>; every other role belongs to exactly one tenant.
/// </summary>
public class User : AuditableEntity, ISoftDeletable
{
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public string? EmployeeCode { get; set; }
    public string FirstName { get; set; } = default!;
    public string? LastName { get; set; }
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = default!;
    public UserRole Role { get; set; }

    public bool IsEmailVerified { get; set; }
    public bool IsActive { get; set; } = true;
    public string? AvatarUrl { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public string? LastLoginIp { get; set; }

    public bool IsDeleted { get; set; }

    public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

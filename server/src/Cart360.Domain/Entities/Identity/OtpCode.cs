using Cart360.Domain.Common;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Identity;

/// <summary>
/// Short-lived one-time code used for email verification, password reset, and
/// (optionally) 2FA login. Stored hashed; matched by re-hashing the submitted code.
/// </summary>
public class OtpCode : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string Email { get; set; } = default!;
    public string CodeHash { get; set; } = default!;
    public OtpPurpose Purpose { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public int AttemptCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

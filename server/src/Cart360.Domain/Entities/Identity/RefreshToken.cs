using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Identity;

/// <summary>
/// Opaque refresh token, stored hashed. Rotated on every use; reuse of a
/// revoked/replaced token triggers full revocation of the token family
/// (see <c>ITokenService.RevokeDescendantTokensAsync</c>).
/// </summary>
public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string TokenHash { get; set; } = default!;
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsRememberMe { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? CreatedByIp { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
}

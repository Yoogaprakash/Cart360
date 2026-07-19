using Cart360.Domain.Entities.Identity;

namespace Cart360.Application.Common.Interfaces;

public record AccessTokenResult(string Token, DateTimeOffset ExpiresAt);

public interface ITokenService
{
    /// <summary>Issues a short-lived JWT carrying sub/tenantId/role/email/permissions claims.</summary>
    AccessTokenResult GenerateAccessToken(User user, IReadOnlyCollection<string> permissionClaims);

    /// <summary>Generates a new opaque, cryptographically random refresh token (plaintext — caller stores only its hash).</summary>
    string GenerateRefreshToken();

    /// <summary>One-way hash used to store refresh tokens / OTP codes at rest and to match a submitted value.</summary>
    string HashToken(string rawToken);
}

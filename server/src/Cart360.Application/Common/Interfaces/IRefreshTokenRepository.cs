using Cart360.Domain.Entities.Identity;

namespace Cart360.Application.Common.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task AddAsync(RefreshToken token, CancellationToken cancellationToken = default);

    /// <summary>Revokes every active token for a user — used on password reset and on refresh-token-reuse detection.</summary>
    Task RevokeAllForUserAsync(Guid userId, string revokedByIp, CancellationToken cancellationToken = default);
}

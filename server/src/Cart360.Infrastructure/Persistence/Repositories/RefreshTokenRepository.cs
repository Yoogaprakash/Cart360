using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly Cart360DbContext _db;

    public RefreshTokenRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default) =>
        _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

    public async Task AddAsync(RefreshToken token, CancellationToken cancellationToken = default) =>
        await _db.RefreshTokens.AddAsync(token, cancellationToken);

    public async Task RevokeAllForUserAsync(Guid userId, string revokedByIp, CancellationToken cancellationToken = default)
    {
        var activeTokens = await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        foreach (var token in activeTokens)
        {
            token.RevokedAt = now;
            token.RevokedByIp = revokedByIp;
        }
    }
}

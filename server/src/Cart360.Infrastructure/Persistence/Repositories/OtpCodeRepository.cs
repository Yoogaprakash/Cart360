using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Identity;
using Cart360.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class OtpCodeRepository : IOtpCodeRepository
{
    private readonly Cart360DbContext _db;

    public OtpCodeRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(OtpCode otp, CancellationToken cancellationToken = default) =>
        await _db.OtpCodes.AddAsync(otp, cancellationToken);

    public Task<OtpCode?> GetActiveAsync(string email, OtpPurpose purpose, CancellationToken cancellationToken = default) =>
        _db.OtpCodes
            .Where(o => o.Email == email && o.Purpose == purpose && !o.IsUsed && o.ExpiresAt > DateTimeOffset.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task InvalidateActiveAsync(string email, OtpPurpose purpose, CancellationToken cancellationToken = default)
    {
        var active = await _db.OtpCodes
            .Where(o => o.Email == email && o.Purpose == purpose && !o.IsUsed)
            .ToListAsync(cancellationToken);

        foreach (var otp in active)
            otp.IsUsed = true;
    }
}

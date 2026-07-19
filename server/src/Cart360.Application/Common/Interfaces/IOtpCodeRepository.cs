using Cart360.Domain.Entities.Identity;
using Cart360.Domain.Enums;

namespace Cart360.Application.Common.Interfaces;

public interface IOtpCodeRepository
{
    Task AddAsync(OtpCode otp, CancellationToken cancellationToken = default);

    /// <summary>Latest not-yet-used, not-yet-expired code for this email/purpose (there should only ever be one active at a time).</summary>
    Task<OtpCode?> GetActiveAsync(string email, OtpPurpose purpose, CancellationToken cancellationToken = default);

    /// <summary>Invalidates any still-active codes for this email/purpose before issuing a new one.</summary>
    Task InvalidateActiveAsync(string email, OtpPurpose purpose, CancellationToken cancellationToken = default);
}

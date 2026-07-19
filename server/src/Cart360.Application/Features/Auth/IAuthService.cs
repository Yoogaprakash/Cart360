namespace Cart360.Application.Features.Auth;

public interface IAuthService
{
    Task<RegisterCompanyResponse> RegisterCompanyAsync(RegisterCompanyRequest request, CancellationToken cancellationToken = default);

    Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken = default);

    Task<LoginResponse> RefreshTokenAsync(string rawRefreshToken, string ipAddress, CancellationToken cancellationToken = default);

    Task LogoutAsync(string rawRefreshToken, string ipAddress, CancellationToken cancellationToken = default);

    /// <summary>Always succeeds from the caller's perspective (no user enumeration) — silently no-ops if the email isn't registered.</summary>
    Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);

    Task ResendOtpAsync(ResendOtpRequest request, CancellationToken cancellationToken = default);

    Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);

    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
}

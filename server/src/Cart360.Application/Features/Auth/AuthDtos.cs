using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Auth;

public record RegisterCompanyRequest(
    string CompanyName,
    string Email,
    string Password,
    string FirstName,
    string? LastName,
    string? Phone);

public record RegisterCompanyResponse(Guid TenantId, Guid UserId, string Message);

public record LoginRequest(string Email, string Password, bool RememberMe);

public record UserSummaryDto(
    Guid Id,
    string Email,
    string FirstName,
    string? LastName,
    UserRole Role,
    Guid? TenantId,
    string? TenantName,
    string? TenantStatus,
    IReadOnlyCollection<PermissionDto> Permissions);

public record PermissionDto(
    string Module,
    bool CanView,
    bool CanCreate,
    bool CanEdit,
    bool CanDelete,
    bool CanPrint,
    bool CanExport);

public record LoginResponse(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    UserSummaryDto User);

public record RefreshTokenRequest(string RefreshToken);

public record LogoutRequest(string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResendOtpRequest(string Email, OtpPurpose Purpose);

public record VerifyEmailRequest(string Email, string Code);

public record ResetPasswordRequest(string Email, string Code, string NewPassword);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

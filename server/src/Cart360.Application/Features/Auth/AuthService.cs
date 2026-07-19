using System.Security.Cryptography;
using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Domain.Entities.Identity;
using Cart360.Domain.Entities.Platform;
using Cart360.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Cart360.Application.Features.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IOtpCodeRepository _otpCodeRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AuthOptions _options;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        ITenantRepository tenantRepository,
        ISubscriptionPlanRepository planRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IOtpCodeRepository otpCodeRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        AuthOptions options,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _planRepository = planRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _otpCodeRepository = otpCodeRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _options = options;
        _logger = logger;
    }

    public async Task<RegisterCompanyResponse> RegisterCompanyAsync(RegisterCompanyRequest request, CancellationToken cancellationToken = default)
    {
        if (await _userRepository.EmailExistsAsync(null, request.Email, cancellationToken))
            throw new ConflictException("An account with this email already exists.");

        var slug = await GenerateUniqueSlugAsync(request.CompanyName, cancellationToken);

        var tenant = new Tenant
        {
            Name = request.CompanyName,
            Slug = slug,
            Status = TenantStatus.Pending,
            Email = request.Email
        };
        await _tenantRepository.AddAsync(tenant, cancellationToken);

        var freePlan = await _planRepository.GetByCodeAsync("FREE", cancellationToken)
            ?? throw new InvalidOperationException("The FREE subscription plan is not seeded.");

        tenant.Subscriptions.Add(new TenantSubscription
        {
            TenantId = tenant.Id,
            Tenant = tenant,
            PlanId = freePlan.Id,
            Plan = freePlan,
            BillingCycle = BillingCycle.Monthly,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow).AddYears(100),
            Status = SubscriptionStatus.Active,
            AutoRenew = false,
            PriceAtPurchase = 0
        });

        var adminUser = new User
        {
            TenantId = tenant.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.CompanyAdmin,
            IsEmailVerified = false,
            IsActive = true
        };
        await _userRepository.AddAsync(adminUser, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await IssueAndSendOtpAsync(adminUser.Id, request.Email, OtpPurpose.EmailVerification, cancellationToken);

        return new RegisterCompanyResponse(
            tenant.Id,
            adminUser.Id,
            "Company registered. Check your email for a verification code. Once verified, your company will await Super Admin approval before you can sign in.");
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAnyTenantAsync(request.Email, cancellationToken);

        if (user is null || !user.IsActive || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new AuthenticationFailedException("Invalid email or password.");

        if (user.Role != UserRole.SuperAdmin)
        {
            if (!user.IsEmailVerified)
                throw new AuthenticationFailedException("Please verify your email address before signing in.");

            var tenant = user.TenantId.HasValue
                ? await _tenantRepository.GetByIdAsync(user.TenantId.Value, cancellationToken)
                : null;

            switch (tenant?.Status)
            {
                case null:
                    throw new AuthenticationFailedException("Your company account could not be found.");
                case TenantStatus.Pending:
                    throw new AuthenticationFailedException("Your company registration is awaiting Super Admin approval.");
                case TenantStatus.Suspended:
                    throw new AuthenticationFailedException("Your company account has been suspended. Contact support.");
                case TenantStatus.Rejected:
                    throw new AuthenticationFailedException("Your company registration was rejected. Contact support.");
            }
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        user.LastLoginIp = ipAddress;

        var response = await IssueTokenPairAsync(user, request.RememberMe, ipAddress, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task<LoginResponse> RefreshTokenAsync(string rawRefreshToken, string ipAddress, CancellationToken cancellationToken = default)
    {
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (existingToken is null)
            throw new AuthenticationFailedException("Invalid refresh token.");

        if (existingToken.RevokedAt is not null)
        {
            // A previously-rotated (or already-logged-out) token was replayed — treat the
            // whole token family as compromised and force a fresh login everywhere.
            await _refreshTokenRepository.RevokeAllForUserAsync(existingToken.UserId, ipAddress, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw new AuthenticationFailedException("This session has been invalidated. Please log in again.");
        }

        if (existingToken.ExpiresAt <= DateTimeOffset.UtcNow)
            throw new AuthenticationFailedException("Your session has expired. Please log in again.");

        var user = await _userRepository.GetByIdAsync(existingToken.UserId, cancellationToken)
            ?? throw new AuthenticationFailedException("Account no longer exists.");

        if (!user.IsActive)
            throw new AuthenticationFailedException("Account is inactive.");

        var response = await IssueTokenPairAsync(user, existingToken.IsRememberMe, ipAddress, cancellationToken);

        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.RevokedByIp = ipAddress;
        existingToken.ReplacedByTokenHash = _tokenService.HashToken(response.RefreshToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task LogoutAsync(string rawRefreshToken, string ipAddress, CancellationToken cancellationToken = default)
    {
        var tokenHash = _tokenService.HashToken(rawRefreshToken);
        var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
        if (existingToken is null || existingToken.RevokedAt is not null) return;

        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.RevokedByIp = ipAddress;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAnyTenantAsync(request.Email, cancellationToken);
        if (user is null || !user.IsActive) return; // no user enumeration

        await IssueAndSendOtpAsync(user.Id, user.Email, OtpPurpose.PasswordReset, cancellationToken);
    }

    public async Task ResendOtpAsync(ResendOtpRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAnyTenantAsync(request.Email, cancellationToken);
        if (user is null) return; // no user enumeration

        await IssueAndSendOtpAsync(user.Id, user.Email, request.Purpose, cancellationToken);
    }

    public async Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
    {
        var otp = await ValidateAndConsumeOtpAsync(request.Email, request.Code, OtpPurpose.EmailVerification, cancellationToken);

        var user = await _userRepository.GetByEmailAnyTenantAsync(request.Email, cancellationToken)
            ?? throw new NotFoundException("User", request.Email);

        user.IsEmailVerified = true;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAndConsumeOtpAsync(request.Email, request.Code, OtpPurpose.PasswordReset, cancellationToken);

        var user = await _userRepository.GetByEmailAnyTenantAsync(request.Email, cancellationToken)
            ?? throw new NotFoundException("User", request.Email);

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        await _refreshTokenRepository.RevokeAllForUserAsync(user.Id, "password-reset", cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AuthenticationFailedException("Current password is incorrect.");

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        await _refreshTokenRepository.RevokeAllForUserAsync(user.Id, "password-change", cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // ---- internal helpers -------------------------------------------------

    private async Task<LoginResponse> IssueTokenPairAsync(User user, bool rememberMe, string ipAddress, CancellationToken cancellationToken)
    {
        var permissionClaims = user.Role == UserRole.Employee
            ? user.Permissions.Where(p => p.CanView).Select(FormatPermissionClaim).ToList()
            : new List<string>();

        var accessToken = _tokenService.GenerateAccessToken(user, permissionClaims);

        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshDays = rememberMe ? _options.RefreshTokenDaysRememberMe : _options.RefreshTokenDays;

        await _refreshTokenRepository.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _tokenService.HashToken(rawRefreshToken),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(refreshDays),
            IsRememberMe = rememberMe,
            CreatedByIp = ipAddress
        }, cancellationToken);

        Tenant? tenant = user.TenantId.HasValue ? await _tenantRepository.GetByIdAsync(user.TenantId.Value, cancellationToken) : null;

        var userDto = new UserSummaryDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.TenantId,
            tenant?.Name,
            tenant?.Status.ToString(),
            user.Permissions.Select(p => new PermissionDto(p.Module, p.CanView, p.CanCreate, p.CanEdit, p.CanDelete, p.CanPrint, p.CanExport)).ToList());

        return new LoginResponse(accessToken.Token, accessToken.ExpiresAt, rawRefreshToken, userDto);
    }

    private static string FormatPermissionClaim(UserPermission p)
    {
        var flags = string.Concat(
            p.CanView ? "V" : "",
            p.CanCreate ? "C" : "",
            p.CanEdit ? "E" : "",
            p.CanDelete ? "D" : "",
            p.CanPrint ? "P" : "",
            p.CanExport ? "X" : "");
        return $"{p.Module}:{flags}";
    }

    private async Task IssueAndSendOtpAsync(Guid userId, string email, OtpPurpose purpose, CancellationToken cancellationToken)
    {
        await _otpCodeRepository.InvalidateActiveAsync(email, purpose, cancellationToken);

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

        await _otpCodeRepository.AddAsync(new OtpCode
        {
            UserId = userId,
            Email = email,
            CodeHash = _tokenService.HashToken(code),
            Purpose = purpose,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_options.OtpExpiryMinutes)
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var (subject, body) = BuildOtpEmail(purpose, code);
        try
        {
            await _emailService.SendAsync(email, email, subject, body, cancellationToken);
        }
        catch (Exception ex)
        {
            // The OTP row is already committed, and "Resend code" exists precisely so a
            // transient mail-provider outage doesn't strand the user — so a delivery
            // failure here must not fail the request that triggered it (registration,
            // login, forgot-password, ...). Log loudly; don't throw.
            _logger.LogError(ex, "Failed to send {Purpose} OTP email to {Email}", purpose, email);
        }
    }

    private async Task<OtpCode> ValidateAndConsumeOtpAsync(string email, string code, OtpPurpose purpose, CancellationToken cancellationToken)
    {
        var otp = await _otpCodeRepository.GetActiveAsync(email, purpose, cancellationToken)
            ?? throw new AuthenticationFailedException("Code is invalid or has expired. Request a new one.");

        if (otp.ExpiresAt <= DateTimeOffset.UtcNow)
            throw new AuthenticationFailedException("Code has expired. Request a new one.");

        if (otp.AttemptCount >= _options.OtpMaxAttempts)
            throw new AuthenticationFailedException("Too many incorrect attempts. Request a new code.");

        if (_tokenService.HashToken(code) != otp.CodeHash)
        {
            otp.AttemptCount++;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw new AuthenticationFailedException("Incorrect code.");
        }

        otp.IsUsed = true;
        otp.UsedAt = DateTimeOffset.UtcNow;
        return otp;
    }

    private async Task<string> GenerateUniqueSlugAsync(string companyName, CancellationToken cancellationToken)
    {
        var baseSlug = string.Concat(companyName.ToLowerInvariant()
                .Select(c => char.IsLetterOrDigit(c) ? c : '-'))
            .Trim('-');

        while (baseSlug.Contains("--")) baseSlug = baseSlug.Replace("--", "-");
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = "company";

        var candidate = baseSlug;
        var suffix = 1;
        while (await _tenantRepository.SlugExistsAsync(candidate, cancellationToken))
        {
            candidate = $"{baseSlug}-{++suffix}";
        }

        return candidate;
    }

    private static (string Subject, string HtmlBody) BuildOtpEmail(OtpPurpose purpose, string code)
    {
        var subject = purpose switch
        {
            OtpPurpose.EmailVerification => "Verify your Cart360 email address",
            OtpPurpose.PasswordReset => "Reset your Cart360 password",
            _ => "Your Cart360 verification code"
        };

        var htmlBody = $"""
            <p>Your Cart360 verification code is:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;">{code}</p>
            <p>This code expires shortly and can only be used once. If you didn't request this, you can safely ignore this email.</p>
            """;

        return (subject, htmlBody);
    }
}

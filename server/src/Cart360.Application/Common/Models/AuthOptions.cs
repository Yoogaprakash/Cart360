namespace Cart360.Application.Common.Models;

/// <summary>Plain POCO (not IOptions&lt;T&gt;) so Application doesn't need to reference Microsoft.Extensions.Options — built and registered as a singleton instance by the API composition root.</summary>
public class AuthOptions
{
    public int RefreshTokenDays { get; set; } = 7;
    public int RefreshTokenDaysRememberMe { get; set; } = 30;
    public int OtpExpiryMinutes { get; set; } = 10;
    public int OtpMaxAttempts { get; set; } = 5;
    public int OtpResendCooldownSeconds { get; set; } = 60;
}

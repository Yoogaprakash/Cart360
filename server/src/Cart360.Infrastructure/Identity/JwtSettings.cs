namespace Cart360.Infrastructure.Identity;

/// <summary>Bound from the "Jwt" configuration section. <see cref="SigningKey"/> must come from an environment
/// variable / secret store in every real environment — see docs/deployment.md.</summary>
public class JwtSettings
{
    public string Issuer { get; set; } = "Cart360";
    public string Audience { get; set; } = "Cart360Client";
    public string SigningKey { get; set; } = default!;
    public int AccessTokenMinutes { get; set; } = 15;
}

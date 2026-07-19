namespace Cart360.Infrastructure.Services;

/// <summary>Bound from the "Smtp" configuration section. Username/Password must come from environment
/// variables / secrets in every real environment — see docs/deployment.md.</summary>
public class EmailOptions
{
    public string Host { get; set; } = default!;
    public int Port { get; set; } = 587;
    public bool UseSsl { get; set; } = true;
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string FromEmail { get; set; } = default!;
    public string FromName { get; set; } = "Cart360";
}

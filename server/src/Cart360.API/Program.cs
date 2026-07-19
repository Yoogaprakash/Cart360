using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using Cart360.API.Filters;
using Cart360.API.Middleware;
using Cart360.Application;
using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Enums;
using Cart360.Infrastructure;
using Cart360.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// One-off operator command, run instead of starting the web host:
//   dotnet run -- seed-superadmin --email you@company.com
// Generates a fresh random password, hashes it, and (re)assigns it to the Super Admin
// row seeded by DbSeeder — that row's password_hash starts as an unusable marker
// specifically so no login can ever succeed until this command has been run once.
if (args.Length > 0 && args[0] == "seed-superadmin")
{
    await RunSeedSuperAdminCommandAsync(args);
    return;
}

var builder = WebApplication.CreateBuilder(args);

// ---- Services -----------------------------------------------------------

builder.Services.AddControllers(options => options.Filters.Add<ValidationActionFilter>())
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Configuration 'Jwt:Key' is not set.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Cart360";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "Cart360Client";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Blunts credential stuffing / OTP brute force without needing an external store.
    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
    });
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    // Render terminates TLS in front of the app; trust its forwarded headers so
    // RemoteIpAddress (used for refresh-token/audit IPs) and https detection are correct.
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddOpenApi();

var app = builder.Build();

// ---- Startup migration + seed ---------------------------------------------
// Safe in every environment: Migrate() is a no-op once the schema is current, and
// DbSeeder's inserts are all existence-checked first. For a managed production release
// process, prefer running `dotnet ef database update` as an explicit release step
// instead and removing this block — see docs/deployment.md.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Cart360DbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

// ---- Middleware pipeline ---------------------------------------------------

app.UseForwardedHeaders();
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

app.UseAuthentication();
app.UseMiddleware<TenantValidationMiddleware>();
app.UseAuthorization();

app.UseRateLimiter();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestampUtc = DateTimeOffset.UtcNow }))
    .AllowAnonymous();

// One-time bootstrap endpoint for environments without Shell/one-off-job access (e.g. Render's
// free tier). Inert unless the SeedSuperAdminToken config value is set; fails closed (404, not
// 401/403, so its existence isn't revealed) on any mismatch. Token is read from a header, not a
// query string, so it doesn't end up in access logs. Remove once you've bootstrapped your
// Super Admin login, or at least rotate/unset the token — see docs/deployment.md.
app.MapPost("/internal/seed-superadmin", async (
    HttpRequest request,
    Cart360DbContext db,
    IPasswordHasher hasher,
    IConfiguration configuration) =>
{
    var expectedToken = configuration["SeedSuperAdminToken"];
    var providedToken = request.Headers["X-Seed-Token"].ToString();
    if (string.IsNullOrEmpty(expectedToken) || providedToken != expectedToken)
        return Results.NotFound();

    var email = request.Query["email"].ToString();
    if (string.IsNullOrWhiteSpace(email)) email = "superadmin@cart360.app";

    var user = await db.Users.IgnoreQueryFilters()
        .FirstOrDefaultAsync(u => u.TenantId == null && u.Email == email && u.Role == UserRole.SuperAdmin);
    if (user is null)
        return Results.NotFound($"No Super Admin user found with email '{email}'.");

    var newPassword = Convert.ToBase64String(RandomNumberGenerator.GetBytes(18))
        .Replace("+", "A").Replace("/", "B").Replace("=", "");

    user.PasswordHash = hasher.Hash(newPassword);
    user.IsEmailVerified = true;
    user.IsActive = true;
    await db.SaveChangesAsync();

    return Results.Ok(new { email, password = newPassword });
}).AllowAnonymous();

app.MapControllers();

app.Run();

static async Task RunSeedSuperAdminCommandAsync(string[] args)
{
    var email = "superadmin@cart360.app";
    for (var i = 1; i < args.Length - 1; i++)
    {
        if (args[i] == "--email") email = args[i + 1];
    }

    // Respect ASPNETCORE_ENVIRONMENT (the convention used everywhere else in this app),
    // since the generic Host otherwise only recognizes DOTNET_ENVIRONMENT.
    var cliBuilder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
    {
        EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
    });
    cliBuilder.Services.AddHttpContextAccessor();
    cliBuilder.Services.AddApplication();
    cliBuilder.Services.AddInfrastructure(cliBuilder.Configuration);
    using var host = cliBuilder.Build();

    using var scope = host.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<Cart360DbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

    var user = await db.Users.IgnoreQueryFilters()
        .FirstOrDefaultAsync(u => u.TenantId == null && u.Email == email && u.Role == UserRole.SuperAdmin);

    if (user is null)
    {
        Console.Error.WriteLine($"No Super Admin user found with email '{email}'.");
        Environment.ExitCode = 1;
        return;
    }

    var newPassword = Convert.ToBase64String(RandomNumberGenerator.GetBytes(18))
        .Replace("+", "A").Replace("/", "B").Replace("=", "");

    user.PasswordHash = hasher.Hash(newPassword);
    user.IsEmailVerified = true;
    user.IsActive = true;
    await db.SaveChangesAsync();

    Console.WriteLine();
    Console.WriteLine("Super Admin password has been reset.");
    Console.WriteLine($"  Email:    {email}");
    Console.WriteLine($"  Password: {newPassword}");
    Console.WriteLine();
    Console.WriteLine("Store this somewhere safe now — it will not be shown again.");
}

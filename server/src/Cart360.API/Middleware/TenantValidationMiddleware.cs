using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Cart360.API.Middleware;

/// <summary>
/// Runs after JWT authentication, before authorization/controllers. Re-validates that the
/// tenant named in the token's <c>tenantId</c> claim still exists and is Active — so a
/// Super Admin suspending/deleting a company takes effect within seconds, not only the
/// next time each user's access token happens to expire and they're forced to log in again.
/// Tenant status is cached briefly (30s) to avoid a DB round-trip on every request while
/// keeping suspension propagation fast.
/// </summary>
public class TenantValidationMiddleware
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;

    public TenantValidationMiddleware(RequestDelegate next, IMemoryCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context, Cart360DbContext db)
    {
        var user = context.User;

        if (user.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        var roleClaim = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (Enum.TryParse<UserRole>(roleClaim, out var role) && role == UserRole.SuperAdmin)
        {
            await _next(context);
            return;
        }

        var tenantIdClaim = user.FindFirst("tenantId")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { title = "Token is missing a valid tenant claim." });
            return;
        }

        var status = await _cache.GetOrCreateAsync($"tenant-status:{tenantId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            return await db.Tenants.IgnoreQueryFilters().AsNoTracking()
                .Where(t => t.Id == tenantId && !t.IsDeleted)
                .Select(t => (TenantStatus?)t.Status)
                .FirstOrDefaultAsync();
        });

        if (status is null)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { title = "Company account could not be found." });
            return;
        }

        if (status != TenantStatus.Active)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { title = $"Company account is {status}.", status = status.ToString() });
            return;
        }

        await _next(context);
    }
}

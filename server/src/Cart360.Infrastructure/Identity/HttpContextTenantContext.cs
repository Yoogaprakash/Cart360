using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace Cart360.Infrastructure.Identity;

/// <summary>
/// Reads the tenant/user identity from the current HTTP request's already-validated
/// JWT claims (set by ASP.NET Core's JWT bearer authentication before this ever runs).
/// Registered Scoped, so a fresh instance — and therefore a fresh <see cref="TenantId"/> —
/// backs every request-scoped <c>Cart360DbContext</c>.
/// </summary>
public sealed class HttpContextTenantContext : ITenantContext, ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpContextTenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private System.Security.Claims.ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid? TenantId
    {
        get
        {
            var claim = User?.FindFirst("tenantId")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public bool IsSuperAdmin => Role == UserRole.SuperAdmin;

    public Guid? UserId
    {
        get
        {
            var claim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public string? Email => User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    public UserRole? Role
    {
        get
        {
            var claim = User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            return Enum.TryParse<UserRole>(claim, out var role) ? role : null;
        }
    }
}

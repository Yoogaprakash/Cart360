using System.Security.Claims;

namespace Cart360.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public static Guid GetTenantId(this ClaimsPrincipal user) =>
        Guid.TryParse(user.FindFirstValue("tenantId"), out var id)
            ? id
            : throw new InvalidOperationException("Request is missing a tenantId claim.");
}

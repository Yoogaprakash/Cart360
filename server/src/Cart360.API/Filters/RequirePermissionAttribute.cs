using Microsoft.AspNetCore.Mvc.Filters;

namespace Cart360.API.Filters;

public enum PermissionAction { View, Create, Edit, Delete, Print, Export }

/// <summary>
/// Enforces the Company Admin-assigned, per-module permission grid for
/// <see cref="Cart360.Domain.Enums.UserRole.Employee"/> users. CompanyAdmin and
/// SuperAdmin always pass (full access by role, per spec); Employee is checked against
/// the compact "perm" claims embedded in their JWT at login (see
/// AuthService.FormatPermissionClaim) — e.g. a claim value "Products:VCE" grants
/// View+Create+Edit but not Delete/Print/Export on the Products module. Any other role
/// (CompanyUser) is denied, since granular module permissions don't apply to it.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string _module;
    private readonly PermissionAction _action;

    public RequirePermissionAttribute(string module, PermissionAction action)
    {
        _module = module;
        _action = action;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user.Identity?.IsAuthenticated != true) return; // [Authorize] already handles this

        var role = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role is "CompanyAdmin" or "SuperAdmin") return;

        if (role != "Employee")
        {
            context.Result = new Microsoft.AspNetCore.Mvc.ForbidResult();
            return;
        }

        var flagChar = _action switch
        {
            PermissionAction.View => 'V',
            PermissionAction.Create => 'C',
            PermissionAction.Edit => 'E',
            PermissionAction.Delete => 'D',
            PermissionAction.Print => 'P',
            PermissionAction.Export => 'X',
            _ => throw new ArgumentOutOfRangeException()
        };

        var hasPermission = user.FindAll("perm")
            .Select(c => c.Value.Split(':', 2))
            .Where(parts => parts.Length == 2 && parts[0] == _module)
            .Any(parts => parts[1].Contains(flagChar));

        if (!hasPermission)
            context.Result = new Microsoft.AspNetCore.Mvc.ForbidResult();
    }
}

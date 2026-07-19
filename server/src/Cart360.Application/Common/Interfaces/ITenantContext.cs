namespace Cart360.Application.Common.Interfaces;

/// <summary>
/// The single source of truth for "which tenant is this request for". Populated
/// exclusively from the validated JWT's "tenantId" claim by the API's
/// tenant-resolution middleware — never from a client-supplied header, query
/// string, or request body field, so it cannot be spoofed by the caller.
/// TenantId is null for a Super Admin request (which has no tenant) and for
/// unauthenticated requests (registration, login, refresh, forgot-password),
/// where the DbContext's global query filters intentionally resolve to
/// "no tenant-scoped rows visible".
/// </summary>
public interface ITenantContext
{
    Guid? TenantId { get; }
    bool IsSuperAdmin { get; }
}

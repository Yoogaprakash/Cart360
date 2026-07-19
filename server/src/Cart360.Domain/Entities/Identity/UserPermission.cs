using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Identity;

/// <summary>
/// Per-user, per-module CRUD/print/export permission grant. Only ever created for
/// <see cref="Cart360.Domain.Enums.UserRole.Employee"/> users — CompanyAdmin/SuperAdmin
/// bypass this entirely via their role, and CompanyUser is implicitly view-only.
/// </summary>
public class UserPermission : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    /// <summary>One of <see cref="Cart360.Domain.Enums.ModuleNames"/>.</summary>
    public string Module { get; set; } = default!;

    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanPrint { get; set; }
    public bool CanExport { get; set; }
}

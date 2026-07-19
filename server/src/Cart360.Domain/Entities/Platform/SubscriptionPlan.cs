using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Platform;

/// <summary>
/// A billing plan (Free, Starter, Professional, Enterprise, ...) that caps usage
/// and gates feature flags for every tenant subscribed to it. Managed exclusively
/// by the Super Admin.
/// </summary>
public class SubscriptionPlan : AuditableEntity
{
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? Description { get; set; }

    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string Currency { get; set; } = "INR";

    public int MaxUsers { get; set; }
    public int MaxEmployees { get; set; }
    public int MaxProducts { get; set; }
    public int MaxCustomers { get; set; }
    public int MaxSuppliers { get; set; }
    public int MaxMonthlyInvoices { get; set; }
    public int MaxMonthlyQuotations { get; set; }
    public int MaxMonthlyPrints { get; set; }
    public int MaxStorageMb { get; set; }
    public int MaxWarehouses { get; set; }

    public bool CanExportPdf { get; set; }
    public bool CanExportExcel { get; set; }
    public bool CanPrint { get; set; } = true;
    public bool CanAddLogo { get; set; }
    public bool CanAddGst { get; set; }
    public bool CanAddMultiBranch { get; set; }
    public bool CanUseApi { get; set; }

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<TenantSubscription> TenantSubscriptions { get; set; } = new List<TenantSubscription>();
}

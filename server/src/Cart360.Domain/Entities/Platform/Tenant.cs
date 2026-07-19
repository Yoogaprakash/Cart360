using Cart360.Domain.Common;
using Cart360.Domain.Enums;
using Cart360.Domain.Entities.Identity;

namespace Cart360.Domain.Entities.Platform;

/// <summary>
/// A Company using Cart360. The root of tenant isolation — every business
/// table elsewhere in the domain carries a <c>TenantId</c> pointing back here.
/// </summary>
public class Tenant : AuditableEntity, ISoftDeletable
{
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public TenantStatus Status { get; set; } = TenantStatus.Pending;

    public string? GstNumber { get; set; }
    public string? PanNumber { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = "India";
    public string? Phone { get; set; }
    public string Email { get; set; } = default!;

    public string? LogoUrl { get; set; }
    public string? SignatureUrl { get; set; }
    public string? TermsAndConditions { get; set; }

    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankIfsc { get; set; }
    public string? BankBranch { get; set; }
    public string? UpiId { get; set; }
    public string? UpiQrUrl { get; set; }

    /// <summary>
    /// Master GST switch for this company. When false, Invoices/Quotations are
    /// created with zero tax regardless of each product's own GST%/CGST%/SGST%
    /// — for businesses (or states/categories) that are GST-exempt or below the
    /// registration threshold. See InvoiceService.CreateAsync.
    /// </summary>
    public bool IsGstEnabled { get; set; } = true;

    public string InvoicePrefix { get; set; } = "INV-";
    public string QuotationPrefix { get; set; } = "QUO-";
    public string PurchasePrefix { get; set; } = "PUR-";
    public string ThemeColor { get; set; } = "#6366F1";
    public string Currency { get; set; } = "INR";
    public string Language { get; set; } = "en";
    public string Timezone { get; set; } = "Asia/Kolkata";

    public DateTimeOffset? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public User? ApprovedByUser { get; set; }

    public DateTimeOffset? SuspendedAt { get; set; }
    public string? SuspendedReason { get; set; }

    public bool IsDeleted { get; set; }

    public ICollection<TenantSubscription> Subscriptions { get; set; } = new List<TenantSubscription>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

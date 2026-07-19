using Cart360.Domain.Common;
using Cart360.Domain.Entities.Purchasing;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Finance;

/// <summary>Money paid out to a Supplier, optionally against a specific Purchase.</summary>
public class Payment : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public string PaymentNumber { get; set; } = default!;
    public DateOnly PaymentDate { get; set; }

    public Guid? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public Guid? PurchaseId { get; set; }
    public Purchase? Purchase { get; set; }

    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }
}

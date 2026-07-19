using Cart360.Domain.Common;
using Cart360.Domain.Entities.Sales;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Finance;

/// <summary>Money received from a Customer, optionally against a specific Invoice.</summary>
public class Receipt : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public string ReceiptNumber { get; set; } = default!;
    public DateOnly ReceiptDate { get; set; }

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }
}

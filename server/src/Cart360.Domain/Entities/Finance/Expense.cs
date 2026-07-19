using Cart360.Domain.Common;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Finance;

public class Expense : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public Guid ExpenseCategoryId { get; set; }
    public ExpenseCategory ExpenseCategory { get; set; } = default!;

    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public string? AttachmentUrl { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }
}

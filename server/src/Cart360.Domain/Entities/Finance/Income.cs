using Cart360.Domain.Common;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Finance;

public class Income : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public Guid IncomeCategoryId { get; set; }
    public IncomeCategory IncomeCategory { get; set; } = default!;

    public decimal Amount { get; set; }
    public DateOnly IncomeDate { get; set; }
    public string? Source { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? Notes { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }
}

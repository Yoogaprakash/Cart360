using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Finance;

public class ExpenseCategory : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = default!;
    public bool IsActive { get; set; } = true;

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}

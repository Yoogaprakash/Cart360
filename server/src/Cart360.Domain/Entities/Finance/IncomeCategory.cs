using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Finance;

public class IncomeCategory : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = default!;
    public bool IsActive { get; set; } = true;

    public ICollection<Income> Incomes { get; set; } = new List<Income>();
}

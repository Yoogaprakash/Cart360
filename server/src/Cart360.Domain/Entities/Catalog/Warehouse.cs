using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Catalog;

public class Warehouse : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? Address { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

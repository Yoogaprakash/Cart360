using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Catalog;

/// <summary>Unit of measure (e.g. "Kilogram" / "kg", "Piece" / "pc").</summary>
public class Unit : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = default!;
    public string ShortCode { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

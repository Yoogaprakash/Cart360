using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Catalog;

/// <summary>Self-referencing so a Category can also act as a Sub Category of another.</summary>
public class Category : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();

    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

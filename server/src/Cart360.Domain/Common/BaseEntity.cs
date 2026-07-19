namespace Cart360.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
}

/// <summary>
/// Base for entities that are created/updated/versioned but are not tenant-scoped
/// (e.g. platform-level entities such as <see cref="Cart360.Domain.Entities.Platform.Tenant"/> itself).
/// </summary>
public abstract class AuditableEntity : BaseEntity, IAuditableEntity, IHasConcurrencyVersion
{
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public int Version { get; set; } = 1;
}

/// <summary>
/// Base for every tenant-scoped, soft-deletable, audited business entity.
/// The EF Core global query filter (tenant + IsDeleted) is applied to every
/// type that derives from this in <c>Cart360DbContext.OnModelCreating</c>.
/// </summary>
public abstract class TenantAuditableEntity : AuditableEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }
    public bool IsDeleted { get; set; }
}

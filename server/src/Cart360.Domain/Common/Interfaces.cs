namespace Cart360.Domain.Common;

/// <summary>Marks an entity as belonging to a single tenant (Company).</summary>
public interface ITenantEntity
{
    Guid TenantId { get; set; }
}

/// <summary>Marks an entity as soft-deletable via <see cref="IsDeleted"/> instead of a hard DELETE.</summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
}

public interface IAuditableEntity
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
    Guid? CreatedBy { get; set; }
    Guid? UpdatedBy { get; set; }
}

/// <summary>Application-managed optimistic concurrency token, incremented by <c>AuditSaveChangesInterceptor</c>.</summary>
public interface IHasConcurrencyVersion
{
    int Version { get; set; }
}

using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Cart360.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Stamps CreatedAt/UpdatedAt/CreatedBy/UpdatedBy, increments the optimistic-concurrency
/// <see cref="IHasConcurrencyVersion.Version"/> column, and turns a hard <c>Remove()</c>
/// into a soft delete (<see cref="ISoftDeletable.IsDeleted"/> = true, state flipped to
/// Modified) for every entity that opts into these contracts — so repository code can call
/// <c>DbSet.Remove(entity)</c> normally and get soft-delete semantics for free.
/// </summary>
public sealed class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditableEntitySaveChangesInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        ApplyAuditRules(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        ApplyAuditRules(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ApplyAuditRules(DbContext? context)
    {
        if (context is null) return;

        var now = DateTimeOffset.UtcNow;
        var userId = _currentUserService.UserId;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            ApplySoftDelete(entry);
            ApplyAuditTimestamps(entry, now, userId);
            ApplyConcurrencyVersion(entry);
        }
    }

    private static void ApplySoftDelete(EntityEntry entry)
    {
        if (entry.State != EntityState.Deleted) return;
        if (entry.Entity is not ISoftDeletable softDeletable) return;

        entry.State = EntityState.Modified;
        softDeletable.IsDeleted = true;
    }

    private static void ApplyAuditTimestamps(EntityEntry entry, DateTimeOffset now, Guid? userId)
    {
        if (entry.Entity is not IAuditableEntity auditable) return;

        switch (entry.State)
        {
            case EntityState.Added:
                auditable.CreatedAt = now;
                auditable.UpdatedAt = now;
                auditable.CreatedBy = userId;
                auditable.UpdatedBy = userId;
                break;
            case EntityState.Modified:
                auditable.UpdatedAt = now;
                auditable.UpdatedBy = userId;
                break;
        }
    }

    private static void ApplyConcurrencyVersion(EntityEntry entry)
    {
        if (entry.Entity is not IHasConcurrencyVersion versioned) return;
        if (entry.State != EntityState.Modified) return;

        versioned.Version += 1;
    }
}

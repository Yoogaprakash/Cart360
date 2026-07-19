using Cart360.Domain.Entities.Platform;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(x => x.Code).IsUnique();
        builder.Property(x => x.Currency).IsRequired().HasMaxLength(3);
        builder.Property(x => x.MonthlyPrice).HasPrecision(14, 2);
        builder.Property(x => x.YearlyPrice).HasPrecision(14, 2);
    }
}

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Email).IsRequired();
        builder.Property(x => x.InvoicePrefix).IsRequired().HasMaxLength(20);
        builder.Property(x => x.QuotationPrefix).IsRequired().HasMaxLength(20);
        builder.Property(x => x.PurchasePrefix).IsRequired().HasMaxLength(20);
        builder.Property(x => x.ThemeColor).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Currency).IsRequired().HasMaxLength(3);
        // A C# property initializer (`= true`) is a CLR-only default — EF Core does not
        // inspect it when generating migrations, so it must be declared explicitly here
        // or new columns silently default to false at the database level.
        builder.Property(x => x.IsGstEnabled).HasDefaultValue(true);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasOne(x => x.ApprovedByUser)
            .WithMany()
            .HasForeignKey(x => x.ApprovedBy)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Status);
    }
}

public class TenantSubscriptionConfiguration : IEntityTypeConfiguration<TenantSubscription>
{
    public void Configure(EntityTypeBuilder<TenantSubscription> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Tenant)
            .WithMany(t => t.Subscriptions)
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Plan)
            .WithMany(p => p.TenantSubscriptions)
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.BillingCycle).IsRequired().HasConversion<string>().HasMaxLength(10);
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.PriceAtPurchase).HasPrecision(14, 2);

        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.TenantId)
            .IsUnique()
            .HasFilter("status = 'Active'")
            .HasDatabaseName("ux_tenant_subscriptions_active");
    }
}

public class PlatformAuditLogConfiguration : IEntityTypeConfiguration<PlatformAuditLog>
{
    public void Configure(EntityTypeBuilder<PlatformAuditLog> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Action).IsRequired().HasMaxLength(100);
        builder.Property(x => x.EntityName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.OldValuesJson).HasColumnType("jsonb");
        builder.Property(x => x.NewValuesJson).HasColumnType("jsonb");

        // No navigation property by design (see Domain entity) — configured via HasOne<Tenant>()
        // so the FK constraint still exists without forcing a Tenant.AuditLogs collection.
        builder.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt });
        builder.HasIndex(x => new { x.EntityName, x.EntityId });
    }
}

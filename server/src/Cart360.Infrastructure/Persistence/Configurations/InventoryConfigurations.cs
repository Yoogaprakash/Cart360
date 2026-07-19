using Cart360.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class StockLedgerEntryConfiguration : IEntityTypeConfiguration<StockLedgerEntry>
{
    public void Configure(EntityTypeBuilder<StockLedgerEntry> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.Batch).WithMany().HasForeignKey(x => x.BatchId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.TransactionType).IsRequired().HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.ReferenceType).HasMaxLength(30);
        builder.Property(x => x.QuantityIn).HasPrecision(14, 3);
        builder.Property(x => x.QuantityOut).HasPrecision(14, 3);
        builder.Property(x => x.BalanceAfter).HasPrecision(14, 3);
        builder.Property(x => x.UnitCost).HasPrecision(14, 2);

        builder.HasIndex(x => new { x.ProductId, x.CreatedAt });
        builder.HasIndex(x => new { x.ReferenceType, x.ReferenceId });
        builder.HasIndex(x => new { x.TenantId, x.CreatedAt });
    }
}

public class StockAdjustmentConfiguration : IEntityTypeConfiguration<StockAdjustment>
{
    public void Configure(EntityTypeBuilder<StockAdjustment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.AdjustmentNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(x => new { x.TenantId, x.AdjustmentNumber }).IsUnique();
    }
}

public class StockAdjustmentItemConfiguration : IEntityTypeConfiguration<StockAdjustmentItem>
{
    public void Configure(EntityTypeBuilder<StockAdjustmentItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.StockAdjustment).WithMany(sa => sa.Items).HasForeignKey(x => x.StockAdjustmentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Batch).WithMany().HasForeignKey(x => x.BatchId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.SystemQuantity).HasPrecision(14, 3);
        builder.Property(x => x.ActualQuantity).HasPrecision(14, 3);
        builder.Ignore(x => x.DifferenceQuantity);
    }
}

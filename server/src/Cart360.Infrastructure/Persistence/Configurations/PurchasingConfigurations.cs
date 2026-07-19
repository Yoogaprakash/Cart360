using Cart360.Domain.Entities.Purchasing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SupplierCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.OutstandingAmount).HasPrecision(14, 2);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasIndex(x => new { x.TenantId, x.SupplierCode }).IsUnique();
    }
}

public class PurchaseConfiguration : IEntityTypeConfiguration<Purchase>
{
    public void Configure(EntityTypeBuilder<Purchase> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PurchaseNumber).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ReferenceBillNumber).HasMaxLength(100);

        builder.HasOne(x => x.Supplier).WithMany(s => s.Purchases).HasForeignKey(x => x.SupplierId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Subtotal).HasPrecision(14, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(14, 2);
        builder.Property(x => x.CgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.SgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.IgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.RoundOff).HasPrecision(6, 2);
        builder.Property(x => x.GrandTotal).HasPrecision(14, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(14, 2);
        builder.Property(x => x.BalanceAmount).HasPrecision(14, 2);
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasIndex(x => new { x.TenantId, x.PurchaseNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.PurchaseDate });
        builder.HasIndex(x => x.SupplierId);
    }
}

public class PurchaseItemConfiguration : IEntityTypeConfiguration<PurchaseItem>
{
    public void Configure(EntityTypeBuilder<PurchaseItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Purchase).WithMany(p => p.Items).HasForeignKey(x => x.PurchaseId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Quantity).HasPrecision(14, 3);
        builder.Property(x => x.UnitPrice).HasPrecision(14, 2);
        builder.Property(x => x.DiscountPercent).HasPrecision(5, 2);
        builder.Property(x => x.GstPercent).HasPrecision(5, 2);
        builder.Property(x => x.CgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.SgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.IgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(14, 2);
        builder.Property(x => x.BatchNumber).HasMaxLength(100);

        builder.HasIndex(x => x.PurchaseId);
        builder.HasIndex(x => x.ProductId);
    }
}

public class PurchaseReturnConfiguration : IEntityTypeConfiguration<PurchaseReturn>
{
    public void Configure(EntityTypeBuilder<PurchaseReturn> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReturnNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Purchase).WithMany().HasForeignKey(x => x.PurchaseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Subtotal).HasPrecision(14, 2);
        builder.Property(x => x.GstAmount).HasPrecision(14, 2);
        builder.Property(x => x.GrandTotal).HasPrecision(14, 2);
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => new { x.TenantId, x.ReturnNumber }).IsUnique();
        builder.HasIndex(x => x.PurchaseId);
    }
}

public class PurchaseReturnItemConfiguration : IEntityTypeConfiguration<PurchaseReturnItem>
{
    public void Configure(EntityTypeBuilder<PurchaseReturnItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.PurchaseReturn).WithMany(pr => pr.Items).HasForeignKey(x => x.PurchaseReturnId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.PurchaseItem).WithMany().HasForeignKey(x => x.PurchaseItemId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Quantity).HasPrecision(14, 3);
        builder.Property(x => x.UnitPrice).HasPrecision(14, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(14, 2);
    }
}

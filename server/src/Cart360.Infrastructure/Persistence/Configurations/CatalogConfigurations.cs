using Cart360.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(30);
        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);

        builder.HasOne(x => x.ParentCategory)
            .WithMany(x => x.SubCategories)
            .HasForeignKey(x => x.ParentCategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => new { x.TenantId, x.ParentCategoryId, x.Name }).IsUnique();
    }
}

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
    }
}

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ShortCode).IsRequired().HasMaxLength(20);
        builder.HasIndex(x => new { x.TenantId, x.ShortCode }).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.Brand).WithMany().HasForeignKey(x => x.BrandId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.Unit).WithMany().HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Sku).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Barcode).HasMaxLength(100);
        builder.Property(x => x.HsnCode).HasMaxLength(20);

        builder.Property(x => x.GstPercent).HasPrecision(5, 2);
        builder.Property(x => x.CgstPercent).HasPrecision(5, 2);
        builder.Property(x => x.SgstPercent).HasPrecision(5, 2);
        builder.Property(x => x.IgstPercent).HasPrecision(5, 2);
        builder.Property(x => x.PurchasePrice).HasPrecision(14, 2);
        builder.Property(x => x.SellingPrice).HasPrecision(14, 2);
        builder.Property(x => x.Mrp).HasPrecision(14, 2);
        builder.Property(x => x.OpeningStock).HasPrecision(14, 3);
        builder.Property(x => x.CurrentStock).HasPrecision(14, 3);
        builder.Property(x => x.MinStockLevel).HasPrecision(14, 3);
        builder.Property(x => x.MaxStockLevel).HasPrecision(14, 3);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasIndex(x => new { x.TenantId, x.Sku }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Barcode });
        builder.HasIndex(x => x.CategoryId);
        builder.Ignore(x => x.IsLowStock);
    }
}

public class ProductBatchConfiguration : IEntityTypeConfiguration<ProductBatch>
{
    public void Configure(EntityTypeBuilder<ProductBatch> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Product).WithMany(p => p.Batches).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.BatchNumber).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Quantity).HasPrecision(14, 3);
        builder.Property(x => x.PurchasePrice).HasPrecision(14, 2);

        builder.HasIndex(x => new { x.ProductId, x.BatchNumber, x.WarehouseId }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.ExpiryDate });
        builder.Ignore(x => x.IsExpired);
    }
}

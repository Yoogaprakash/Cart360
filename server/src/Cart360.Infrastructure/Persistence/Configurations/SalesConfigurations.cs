using Cart360.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CustomerCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.GstNumber).HasMaxLength(20);
        builder.Property(x => x.OutstandingAmount).HasPrecision(14, 2);
        builder.Property(x => x.CreditLimit).HasPrecision(14, 2);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasIndex(x => new { x.TenantId, x.CustomerCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Name });
    }
}

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.InvoiceNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Customer).WithMany(c => c.Invoices).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Subtotal).HasPrecision(14, 2);
        builder.Property(x => x.DiscountPercent).HasPrecision(5, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(14, 2);
        builder.Property(x => x.CgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.SgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.IgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.RoundOff).HasPrecision(6, 2);
        builder.Property(x => x.GrandTotal).HasPrecision(14, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(14, 2);
        builder.Property(x => x.BalanceAmount).HasPrecision(14, 2);
        builder.Property(x => x.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasIndex(x => new { x.TenantId, x.InvoiceNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.InvoiceDate });
        builder.HasIndex(x => x.CustomerId);
        builder.HasIndex(x => new { x.TenantId, x.Status });
    }
}

public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Invoice).WithMany(i => i.Items).HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Batch).WithMany().HasForeignKey(x => x.BatchId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Description).HasMaxLength(255);
        builder.Property(x => x.Quantity).HasPrecision(14, 3);
        builder.Property(x => x.UnitPrice).HasPrecision(14, 2);
        builder.Property(x => x.DiscountPercent).HasPrecision(5, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(14, 2);
        builder.Property(x => x.GstPercent).HasPrecision(5, 2);
        builder.Property(x => x.CgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.SgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.IgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(14, 2);

        builder.HasIndex(x => x.InvoiceId);
        builder.HasIndex(x => x.ProductId);
    }
}

public class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
{
    public void Configure(EntityTypeBuilder<Quotation> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.QuotationNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Customer).WithMany(c => c.Quotations).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ConvertedInvoice).WithOne().HasForeignKey<Quotation>(x => x.ConvertedInvoiceId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Subtotal).HasPrecision(14, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(14, 2);
        builder.Property(x => x.CgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.SgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.IgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.RoundOff).HasPrecision(6, 2);
        builder.Property(x => x.GrandTotal).HasPrecision(14, 2);
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.HasIndex(x => new { x.TenantId, x.QuotationNumber }).IsUnique();
        builder.HasIndex(x => x.ConvertedInvoiceId).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.QuotationDate });
        builder.HasIndex(x => new { x.TenantId, x.Status });
    }
}

public class QuotationItemConfiguration : IEntityTypeConfiguration<QuotationItem>
{
    public void Configure(EntityTypeBuilder<QuotationItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Quotation).WithMany(q => q.Items).HasForeignKey(x => x.QuotationId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Description).HasMaxLength(255);
        builder.Property(x => x.Quantity).HasPrecision(14, 3);
        builder.Property(x => x.UnitPrice).HasPrecision(14, 2);
        builder.Property(x => x.DiscountPercent).HasPrecision(5, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(14, 2);
        builder.Property(x => x.GstPercent).HasPrecision(5, 2);
        builder.Property(x => x.CgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.SgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.IgstAmount).HasPrecision(14, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(14, 2);

        builder.HasIndex(x => x.QuotationId);
    }
}

public class SalesReturnConfiguration : IEntityTypeConfiguration<SalesReturn>
{
    public void Configure(EntityTypeBuilder<SalesReturn> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReturnNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Subtotal).HasPrecision(14, 2);
        builder.Property(x => x.GstAmount).HasPrecision(14, 2);
        builder.Property(x => x.GrandTotal).HasPrecision(14, 2);
        builder.Property(x => x.Status).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => new { x.TenantId, x.ReturnNumber }).IsUnique();
        builder.HasIndex(x => x.InvoiceId);
    }
}

public class SalesReturnItemConfiguration : IEntityTypeConfiguration<SalesReturnItem>
{
    public void Configure(EntityTypeBuilder<SalesReturnItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.SalesReturn).WithMany(sr => sr.Items).HasForeignKey(x => x.SalesReturnId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.InvoiceItem).WithMany().HasForeignKey(x => x.InvoiceItemId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Quantity).HasPrecision(14, 3);
        builder.Property(x => x.UnitPrice).HasPrecision(14, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(14, 2);
    }
}

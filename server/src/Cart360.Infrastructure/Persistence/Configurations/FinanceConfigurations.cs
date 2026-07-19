using Cart360.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class ExpenseCategoryConfiguration : IEntityTypeConfiguration<ExpenseCategory>
{
    public void Configure(EntityTypeBuilder<ExpenseCategory> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
    }
}

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.ExpenseCategory).WithMany(c => c.Expenses).HasForeignKey(x => x.ExpenseCategoryId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Amount).HasPrecision(14, 2);
        builder.Property(x => x.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.ReferenceNumber).HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.ExpenseDate });
    }
}

public class IncomeCategoryConfiguration : IEntityTypeConfiguration<IncomeCategory>
{
    public void Configure(EntityTypeBuilder<IncomeCategory> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
    }
}

public class IncomeConfiguration : IEntityTypeConfiguration<Income>
{
    public void Configure(EntityTypeBuilder<Income> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.IncomeCategory).WithMany(c => c.Incomes).HasForeignKey(x => x.IncomeCategoryId).OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Amount).HasPrecision(14, 2);
        builder.Property(x => x.Source).HasMaxLength(150);
        builder.Property(x => x.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => new { x.TenantId, x.IncomeDate });
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PaymentNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Purchase).WithMany().HasForeignKey(x => x.PurchaseId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Amount).HasPrecision(14, 2);
        builder.Property(x => x.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.ReferenceNumber).HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.PaymentNumber }).IsUnique();
        builder.HasIndex(x => x.SupplierId);
    }
}

public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
{
    public void Configure(EntityTypeBuilder<Receipt> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReceiptNumber).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Amount).HasPrecision(14, 2);
        builder.Property(x => x.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.ReferenceNumber).HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.ReceiptNumber }).IsUnique();
        builder.HasIndex(x => x.CustomerId);
    }
}

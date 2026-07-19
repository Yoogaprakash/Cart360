using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Entities.Finance;
using Cart360.Domain.Entities.Identity;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Entities.Platform;
using Cart360.Domain.Entities.Purchasing;
using Cart360.Domain.Entities.Sales;
using Cart360.Domain.Entities.Settings;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence;

/// <summary>
/// The single EF Core DbContext for Cart360. Multi-tenancy is enforced here via
/// global query filters keyed off <see cref="_currentTenantId"/> — a private field
/// (not an injected singleton captured by value) so that EF Core's supported
/// "context instance member" pattern re-evaluates it against whichever scoped
/// DbContext instance is actually executing the query, per request. See
/// docs/architecture.md §4 for the tenant isolation rationale.
/// </summary>
public class Cart360DbContext : DbContext, IUnitOfWork
{
    private readonly Guid? _currentTenantId;

    public Cart360DbContext(DbContextOptions<Cart360DbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _currentTenantId = tenantContext.TenantId;
    }

    // Platform
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantSubscription> TenantSubscriptions => Set<TenantSubscription>();
    public DbSet<PlatformAuditLog> PlatformAuditLogs => Set<PlatformAuditLog>();

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    // Catalog
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductBatch> ProductBatches => Set<ProductBatch>();

    // Sales
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationItem> QuotationItems => Set<QuotationItem>();
    public DbSet<SalesReturn> SalesReturns => Set<SalesReturn>();
    public DbSet<SalesReturnItem> SalesReturnItems => Set<SalesReturnItem>();

    // Purchasing
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>();
    public DbSet<PurchaseReturn> PurchaseReturns => Set<PurchaseReturn>();
    public DbSet<PurchaseReturnItem> PurchaseReturnItems => Set<PurchaseReturnItem>();

    // Inventory
    public DbSet<StockLedgerEntry> StockLedgerEntries => Set<StockLedgerEntry>();
    public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();
    public DbSet<StockAdjustmentItem> StockAdjustmentItems => Set<StockAdjustmentItem>();

    // Finance
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<IncomeCategory> IncomeCategories => Set<IncomeCategory>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Receipt> Receipts => Set<Receipt>();

    // Settings
    public DbSet<PrinterSettings> PrinterSettings => Set<PrinterSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Cart360DbContext).Assembly);

        ApplyGlobalQueryFilters(modelBuilder);
    }

    /// <summary>
    /// Tenant isolation + soft-delete, applied per entity type. Deliberately explicit
    /// (not reflection-driven) so every filter is a plain, readable, debuggable lambda —
    /// and so entities that must NOT be tenant-filtered (RefreshToken, OtpCode,
    /// UserPermission — all resolved by UserId in contexts where the tenant isn't
    /// known yet, e.g. during login/refresh) are easy to spot by their absence below.
    /// Super Admin cross-tenant reads (companies list, revenue reports, ...) must call
    /// <c>.IgnoreQueryFilters()</c> explicitly in the relevant service method — a
    /// deliberate, reviewable escape hatch rather than a silent "if SuperAdmin" branch
    /// baked into every filter.
    /// </summary>
    private void ApplyGlobalQueryFilters(ModelBuilder modelBuilder)
    {
        // Platform: soft-delete only, not tenant-scoped (these tables describe tenants).
        modelBuilder.Entity<Tenant>().HasQueryFilter(t => !t.IsDeleted);

        // Identity
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted && u.TenantId == _currentTenantId);
        modelBuilder.Entity<Notification>().HasQueryFilter(n => n.TenantId == _currentTenantId);
        modelBuilder.Entity<ActivityLog>().HasQueryFilter(a => a.TenantId == _currentTenantId);

        // Catalog
        modelBuilder.Entity<Warehouse>().HasQueryFilter(w => !w.IsDeleted && w.TenantId == _currentTenantId);
        modelBuilder.Entity<Category>().HasQueryFilter(c => !c.IsDeleted && c.TenantId == _currentTenantId);
        modelBuilder.Entity<Brand>().HasQueryFilter(b => !b.IsDeleted && b.TenantId == _currentTenantId);
        modelBuilder.Entity<Unit>().HasQueryFilter(u => !u.IsDeleted && u.TenantId == _currentTenantId);
        modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted && p.TenantId == _currentTenantId);
        modelBuilder.Entity<ProductBatch>().HasQueryFilter(pb => pb.TenantId == _currentTenantId);

        // Sales
        modelBuilder.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted && c.TenantId == _currentTenantId);
        modelBuilder.Entity<Invoice>().HasQueryFilter(i => !i.IsDeleted && i.TenantId == _currentTenantId);
        modelBuilder.Entity<InvoiceItem>().HasQueryFilter(ii => ii.Invoice.TenantId == _currentTenantId);
        modelBuilder.Entity<Quotation>().HasQueryFilter(q => !q.IsDeleted && q.TenantId == _currentTenantId);
        modelBuilder.Entity<QuotationItem>().HasQueryFilter(qi => qi.Quotation.TenantId == _currentTenantId);
        modelBuilder.Entity<SalesReturn>().HasQueryFilter(sr => !sr.IsDeleted && sr.TenantId == _currentTenantId);
        modelBuilder.Entity<SalesReturnItem>().HasQueryFilter(sri => sri.SalesReturn.TenantId == _currentTenantId);

        // Purchasing
        modelBuilder.Entity<Supplier>().HasQueryFilter(s => !s.IsDeleted && s.TenantId == _currentTenantId);
        modelBuilder.Entity<Purchase>().HasQueryFilter(p => !p.IsDeleted && p.TenantId == _currentTenantId);
        modelBuilder.Entity<PurchaseItem>().HasQueryFilter(pi => pi.Purchase.TenantId == _currentTenantId);
        modelBuilder.Entity<PurchaseReturn>().HasQueryFilter(pr => !pr.IsDeleted && pr.TenantId == _currentTenantId);
        modelBuilder.Entity<PurchaseReturnItem>().HasQueryFilter(pri => pri.PurchaseReturn.TenantId == _currentTenantId);

        // Inventory
        modelBuilder.Entity<StockLedgerEntry>().HasQueryFilter(sl => sl.TenantId == _currentTenantId);
        modelBuilder.Entity<StockAdjustment>().HasQueryFilter(sa => !sa.IsDeleted && sa.TenantId == _currentTenantId);
        modelBuilder.Entity<StockAdjustmentItem>().HasQueryFilter(sai => sai.StockAdjustment.TenantId == _currentTenantId);

        // Finance
        modelBuilder.Entity<ExpenseCategory>().HasQueryFilter(ec => ec.TenantId == _currentTenantId);
        modelBuilder.Entity<Expense>().HasQueryFilter(e => !e.IsDeleted && e.TenantId == _currentTenantId);
        modelBuilder.Entity<IncomeCategory>().HasQueryFilter(ic => ic.TenantId == _currentTenantId);
        modelBuilder.Entity<Income>().HasQueryFilter(i => !i.IsDeleted && i.TenantId == _currentTenantId);
        modelBuilder.Entity<Payment>().HasQueryFilter(p => !p.IsDeleted && p.TenantId == _currentTenantId);
        modelBuilder.Entity<Receipt>().HasQueryFilter(r => !r.IsDeleted && r.TenantId == _currentTenantId);

        // Settings
        modelBuilder.Entity<PrinterSettings>().HasQueryFilter(ps => ps.TenantId == _currentTenantId);
    }
}

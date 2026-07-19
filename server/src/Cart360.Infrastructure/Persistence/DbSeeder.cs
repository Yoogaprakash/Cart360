using Cart360.Domain.Entities.Platform;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence;

/// <summary>
/// Idempotent startup seeding — mirrors database/seed.sql so a fresh database (local
/// dev, or a brand-new Render+Supabase environment) is immediately usable without a
/// manual SQL step. Safe to call on every startup: every insert is guarded by an
/// existence check.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(Cart360DbContext db, CancellationToken cancellationToken = default)
    {
        await SeedSubscriptionPlansAsync(db, cancellationToken);
        await SeedSuperAdminAsync(db, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedSubscriptionPlansAsync(Cart360DbContext db, CancellationToken cancellationToken)
    {
        if (await db.SubscriptionPlans.IgnoreQueryFilters().AnyAsync(cancellationToken))
            return;

        db.SubscriptionPlans.AddRange(
            new SubscriptionPlan
            {
                Name = "Free", Code = "FREE", Description = "Get started with basic billing for very small businesses.",
                MonthlyPrice = 0, YearlyPrice = 0, Currency = "INR",
                MaxUsers = 1, MaxEmployees = 0, MaxProducts = 25, MaxCustomers = 25, MaxSuppliers = 10,
                MaxMonthlyInvoices = 20, MaxMonthlyQuotations = 10, MaxMonthlyPrints = 20, MaxStorageMb = 50, MaxWarehouses = 1,
                CanExportPdf = false, CanExportExcel = false, CanPrint = true, CanAddLogo = false, CanAddGst = false,
                CanAddMultiBranch = false, CanUseApi = false, IsActive = true, SortOrder = 1
            },
            new SubscriptionPlan
            {
                Name = "Starter", Code = "STARTER", Description = "For small businesses ready to grow with GST billing.",
                MonthlyPrice = 499, YearlyPrice = 4999, Currency = "INR",
                MaxUsers = 3, MaxEmployees = 2, MaxProducts = 200, MaxCustomers = 200, MaxSuppliers = 50,
                MaxMonthlyInvoices = 150, MaxMonthlyQuotations = 100, MaxMonthlyPrints = 300, MaxStorageMb = 500, MaxWarehouses = 1,
                CanExportPdf = true, CanExportExcel = false, CanPrint = true, CanAddLogo = true, CanAddGst = true,
                CanAddMultiBranch = false, CanUseApi = false, IsActive = true, SortOrder = 2
            },
            new SubscriptionPlan
            {
                Name = "Professional", Code = "PROFESSIONAL", Description = "Multi-user, multi-branch billing with full reporting.",
                MonthlyPrice = 1499, YearlyPrice = 14999, Currency = "INR",
                MaxUsers = 10, MaxEmployees = 8, MaxProducts = 2000, MaxCustomers = 2000, MaxSuppliers = 300,
                MaxMonthlyInvoices = 1000, MaxMonthlyQuotations = 500, MaxMonthlyPrints = 2000, MaxStorageMb = 5000, MaxWarehouses = 3,
                CanExportPdf = true, CanExportExcel = true, CanPrint = true, CanAddLogo = true, CanAddGst = true,
                CanAddMultiBranch = true, CanUseApi = false, IsActive = true, SortOrder = 3
            },
            new SubscriptionPlan
            {
                Name = "Enterprise", Code = "ENTERPRISE", Description = "Unlimited scale with API access for large operations.",
                MonthlyPrice = 4999, YearlyPrice = 49999, Currency = "INR",
                MaxUsers = 100, MaxEmployees = 100, MaxProducts = 100000, MaxCustomers = 100000, MaxSuppliers = 5000,
                MaxMonthlyInvoices = 50000, MaxMonthlyQuotations = 20000, MaxMonthlyPrints = 100000, MaxStorageMb = 51200, MaxWarehouses = 20,
                CanExportPdf = true, CanExportExcel = true, CanPrint = true, CanAddLogo = true, CanAddGst = true,
                CanAddMultiBranch = true, CanUseApi = true, IsActive = true, SortOrder = 4
            });
    }

    private static async Task SeedSuperAdminAsync(Cart360DbContext db, CancellationToken cancellationToken)
    {
        const string superAdminEmail = "superadmin@cart360.app";

        var exists = await db.Users.IgnoreQueryFilters()
            .AnyAsync(u => u.TenantId == null && u.Email == superAdminEmail, cancellationToken);
        if (exists) return;

        // Deliberately not a valid BCrypt hash — see database/seed.sql for why, and
        // docs/deployment.md "First deploy" for the seed-superadmin bootstrap command
        // that replaces this with a real hash of a freshly generated password.
        db.Users.Add(new Domain.Entities.Identity.User
        {
            TenantId = null,
            FirstName = "Super",
            LastName = "Admin",
            Email = superAdminEmail,
            PasswordHash = "UNSET-RUN-SEED-SUPERADMIN-COMMAND",
            Role = Domain.Enums.UserRole.SuperAdmin,
            IsEmailVerified = true,
            IsActive = true
        });
    }
}

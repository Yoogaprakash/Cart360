using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Platform;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class SubscriptionLimitService : ISubscriptionLimitService
{
    private readonly Cart360DbContext _db;

    public SubscriptionLimitService(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task EnsureCanAddAsync(Guid tenantId, SubscriptionLimitType limitType, int quantity = 1, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, limitType, cancellationToken);
        if (usage.IsUnlimited) return;

        if (usage.Current + quantity > usage.Max)
            throw new SubscriptionLimitExceededException(limitType.ToString(), usage.Max);
    }

    public async Task<SubscriptionUsageDto> GetUsageAsync(Guid tenantId, SubscriptionLimitType limitType, CancellationToken cancellationToken = default)
    {
        var plan = await GetActivePlanAsync(tenantId, cancellationToken);

        var max = limitType switch
        {
            SubscriptionLimitType.Users => plan.MaxUsers,
            SubscriptionLimitType.Employees => plan.MaxEmployees,
            SubscriptionLimitType.Products => plan.MaxProducts,
            SubscriptionLimitType.Customers => plan.MaxCustomers,
            SubscriptionLimitType.Suppliers => plan.MaxSuppliers,
            SubscriptionLimitType.MonthlyInvoices => plan.MaxMonthlyInvoices,
            SubscriptionLimitType.MonthlyQuotations => plan.MaxMonthlyQuotations,
            SubscriptionLimitType.MonthlyPrints => plan.MaxMonthlyPrints,
            SubscriptionLimitType.StorageMb => plan.MaxStorageMb,
            SubscriptionLimitType.Warehouses => plan.MaxWarehouses,
            _ => throw new ArgumentOutOfRangeException(nameof(limitType))
        };

        // A cap of 0-or-negative on a non-count-based flag would be a data error; treat any
        // configured max <= 0 for genuinely uncapped tiers as "unlimited" is NOT assumed here —
        // 0 always means "not allowed" and a real positive number is a real cap. "Unlimited" in
        // Cart360 is represented as a very large number on the Enterprise plan, not a sentinel,
        // so plan limits stay simple integers with no special-casing in reports/UI.
        var current = await CountUsageAsync(tenantId, limitType, cancellationToken);
        return new SubscriptionUsageDto(limitType, current, max, IsUnlimited: false);
    }

    public async Task<bool> HasFeatureAsync(Guid tenantId, string featureFlag, CancellationToken cancellationToken = default)
    {
        var plan = await GetActivePlanAsync(tenantId, cancellationToken);

        return featureFlag switch
        {
            "CanExportPdf" => plan.CanExportPdf,
            "CanExportExcel" => plan.CanExportExcel,
            "CanPrint" => plan.CanPrint,
            "CanAddLogo" => plan.CanAddLogo,
            "CanAddGst" => plan.CanAddGst,
            "CanAddMultiBranch" => plan.CanAddMultiBranch,
            "CanUseApi" => plan.CanUseApi,
            _ => throw new ArgumentException($"Unknown feature flag '{featureFlag}'.", nameof(featureFlag))
        };
    }

    private async Task<SubscriptionPlan> GetActivePlanAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var subscription = await _db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active)
            .FirstOrDefaultAsync(cancellationToken);

        return subscription?.Plan
            ?? throw new InvalidOperationException($"Tenant '{tenantId}' has no active subscription.");
    }

    private async Task<int> CountUsageAsync(Guid tenantId, SubscriptionLimitType limitType, CancellationToken cancellationToken)
    {
        var monthStart = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

        return limitType switch
        {
            SubscriptionLimitType.Users => await _db.Users.IgnoreQueryFilters()
                .CountAsync(u => u.TenantId == tenantId && !u.IsDeleted, cancellationToken),

            SubscriptionLimitType.Employees => await _db.Users.IgnoreQueryFilters()
                .CountAsync(u => u.TenantId == tenantId && !u.IsDeleted && u.Role == UserRole.Employee, cancellationToken),

            SubscriptionLimitType.Products => await _db.Products.IgnoreQueryFilters()
                .CountAsync(p => p.TenantId == tenantId && !p.IsDeleted, cancellationToken),

            SubscriptionLimitType.Customers => await _db.Customers.IgnoreQueryFilters()
                .CountAsync(c => c.TenantId == tenantId && !c.IsDeleted, cancellationToken),

            SubscriptionLimitType.Suppliers => await _db.Suppliers.IgnoreQueryFilters()
                .CountAsync(s => s.TenantId == tenantId && !s.IsDeleted, cancellationToken),

            SubscriptionLimitType.MonthlyInvoices => await _db.Invoices.IgnoreQueryFilters()
                .CountAsync(i => i.TenantId == tenantId && !i.IsDeleted && i.InvoiceDate >= monthStart, cancellationToken),

            SubscriptionLimitType.MonthlyQuotations => await _db.Quotations.IgnoreQueryFilters()
                .CountAsync(q => q.TenantId == tenantId && !q.IsDeleted && q.QuotationDate >= monthStart, cancellationToken),

            SubscriptionLimitType.MonthlyPrints => await _db.Invoices.IgnoreQueryFilters()
                .Where(i => i.TenantId == tenantId && !i.IsDeleted && i.InvoiceDate >= monthStart)
                .SumAsync(i => (int?)i.PrintCount, cancellationToken) ?? 0,

            SubscriptionLimitType.Warehouses => await _db.Warehouses.IgnoreQueryFilters()
                .CountAsync(w => w.TenantId == tenantId && !w.IsDeleted, cancellationToken),

            // Storage usage tracking (summed uploaded file sizes) lands with the file-upload
            // feature; until then, report 0 used rather than block uploads on an unimplemented metric.
            SubscriptionLimitType.StorageMb => 0,

            _ => throw new ArgumentOutOfRangeException(nameof(limitType))
        };
    }
}

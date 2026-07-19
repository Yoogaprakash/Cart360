using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Tenants;
using Cart360.Domain.Entities.Platform;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class CompanyService : ICompanyService
{
    private readonly Cart360DbContext _db;

    public CompanyService(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<CompanyListItemDto>> GetPagedCompaniesAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Tenants.IgnoreQueryFilters().Where(t => !t.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(t => EF.Functions.ILike(t.Name, $"%{search}%") || EF.Functions.ILike(t.Email, $"%{search}%"));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "status" => request.SortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            _ => request.SortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var tenants = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                t.Status,
                t.Email,
                t.CreatedAt,
                PlanName = t.Subscriptions
                    .Where(s => s.Status == SubscriptionStatus.Active)
                    .Select(s => s.Plan.Name)
                    .FirstOrDefault(),
                UserCount = _db.Users.IgnoreQueryFilters().Count(u => u.TenantId == t.Id && !u.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        var items = tenants
            .Select(t => new CompanyListItemDto(t.Id, t.Name, t.Slug, t.Status, t.Email, t.PlanName, t.UserCount, t.CreatedAt))
            .ToList();

        return PagedResult<CompanyListItemDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public async Task<CompanyDetailDto> GetCompanyDetailAsync(Guid tenantId, CancellationToken cancellationToken = default) =>
        await MapDetailAsync(await LoadTenantAsync(tenantId, cancellationToken), cancellationToken);

    public async Task ApproveCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var tenant = await LoadTenantAsync(tenantId, cancellationToken);
        tenant.Status = TenantStatus.Active;
        tenant.ApprovedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task SuspendCompanyAsync(Guid tenantId, SuspendCompanyRequest request, CancellationToken cancellationToken = default)
    {
        var tenant = await LoadTenantAsync(tenantId, cancellationToken);
        tenant.Status = TenantStatus.Suspended;
        tenant.SuspendedAt = DateTimeOffset.UtcNow;
        tenant.SuspendedReason = request.Reason;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task ReactivateCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var tenant = await LoadTenantAsync(tenantId, cancellationToken);
        tenant.Status = TenantStatus.Active;
        tenant.SuspendedAt = null;
        tenant.SuspendedReason = null;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task RejectCompanyAsync(Guid tenantId, RejectCompanyRequest request, CancellationToken cancellationToken = default)
    {
        var tenant = await LoadTenantAsync(tenantId, cancellationToken);
        tenant.Status = TenantStatus.Rejected;
        tenant.SuspendedReason = request.Reason;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        _ = await LoadTenantAsync(tenantId, cancellationToken); // 404 if it doesn't exist

        // Deliberate hard DELETE (not the interceptor's soft-delete path) — Super Admin
        // "delete company" is explicitly a permanent operation per spec. Postgres's
        // ON DELETE CASCADE on every tenant_id foreign key (see database/schema.sql)
        // removes every dependent row across all ~30 tenant-scoped tables.
        await _db.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM tenants WHERE id = {tenantId}", cancellationToken);
    }

    public async Task ChangePlanAsync(Guid tenantId, ChangeCompanyPlanRequest request, CancellationToken cancellationToken = default)
    {
        _ = await LoadTenantAsync(tenantId, cancellationToken);

        var plan = await _db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == request.PlanId, cancellationToken)
            ?? throw new NotFoundException("SubscriptionPlan", request.PlanId);

        var currentSubscription = await _db.TenantSubscriptions.IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active, cancellationToken);

        if (currentSubscription is not null)
            currentSubscription.Status = SubscriptionStatus.Cancelled;

        _db.TenantSubscriptions.Add(new TenantSubscription
        {
            TenantId = tenantId,
            PlanId = plan.Id,
            BillingCycle = BillingCycle.Monthly,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow).AddYears(1),
            Status = SubscriptionStatus.Active,
            AutoRenew = true,
            PriceAtPurchase = plan.MonthlyPrice
        });

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<CompanyDetailDto> GetMyCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default) =>
        await GetCompanyDetailAsync(tenantId, cancellationToken);

    public async Task UpdateMyCompanyAsync(Guid tenantId, UpdateCompanySettingsRequest request, CancellationToken cancellationToken = default)
    {
        var tenant = await LoadTenantAsync(tenantId, cancellationToken);

        tenant.Name = request.Name;
        tenant.GstNumber = request.GstNumber;
        tenant.PanNumber = request.PanNumber;
        tenant.AddressLine1 = request.AddressLine1;
        tenant.AddressLine2 = request.AddressLine2;
        tenant.City = request.City;
        tenant.State = request.State;
        tenant.PostalCode = request.PostalCode;
        tenant.Country = request.Country ?? tenant.Country;
        tenant.Phone = request.Phone;
        tenant.Email = request.Email;
        tenant.LogoUrl = request.LogoUrl;
        tenant.SignatureUrl = request.SignatureUrl;
        tenant.TermsAndConditions = request.TermsAndConditions;
        tenant.BankName = request.BankName;
        tenant.BankAccountNumber = request.BankAccountNumber;
        tenant.BankIfsc = request.BankIfsc;
        tenant.BankBranch = request.BankBranch;
        tenant.UpiId = request.UpiId;
        tenant.UpiQrUrl = request.UpiQrUrl;
        tenant.IsGstEnabled = request.IsGstEnabled;
        tenant.InvoicePrefix = request.InvoicePrefix;
        tenant.QuotationPrefix = request.QuotationPrefix;
        tenant.PurchasePrefix = request.PurchasePrefix;
        tenant.ThemeColor = request.ThemeColor;
        tenant.Currency = request.Currency;
        tenant.Language = request.Language;
        tenant.Timezone = request.Timezone;

        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<Tenant> LoadTenantAsync(Guid tenantId, CancellationToken cancellationToken) =>
        await _db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == tenantId && !t.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Company", tenantId);

    private async Task<CompanyDetailDto> MapDetailAsync(Tenant tenant, CancellationToken cancellationToken)
    {
        var activeSubscription = await _db.TenantSubscriptions.IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.TenantId == tenant.Id && s.Status == SubscriptionStatus.Active)
            .FirstOrDefaultAsync(cancellationToken);

        return new CompanyDetailDto(
            tenant.Id, tenant.Name, tenant.Slug, tenant.Status,
            tenant.GstNumber, tenant.PanNumber,
            tenant.AddressLine1, tenant.AddressLine2, tenant.City, tenant.State, tenant.PostalCode, tenant.Country,
            tenant.Phone, tenant.Email,
            tenant.LogoUrl, tenant.SignatureUrl, tenant.TermsAndConditions,
            tenant.BankName, tenant.BankAccountNumber, tenant.BankIfsc, tenant.BankBranch, tenant.UpiId, tenant.UpiQrUrl,
            tenant.IsGstEnabled,
            tenant.InvoicePrefix, tenant.QuotationPrefix, tenant.PurchasePrefix,
            tenant.ThemeColor, tenant.Currency, tenant.Language, tenant.Timezone,
            activeSubscription?.Plan.Name, activeSubscription?.Plan.Code, activeSubscription?.EndDate,
            tenant.CreatedAt);
    }
}

using Cart360.Application.Common.Exceptions;
using Cart360.Application.Features.SuperAdmin;
using Cart360.Domain.Entities.Platform;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class SubscriptionPlanAdminService : ISubscriptionPlanAdminService
{
    private readonly Cart360DbContext _db;

    public SubscriptionPlanAdminService(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<SubscriptionPlanDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.SubscriptionPlans.OrderBy(p => p.SortOrder).Select(ProjectToDto()).ToListAsync(cancellationToken);

    public async Task<SubscriptionPlanDto> CreateAsync(UpsertSubscriptionPlanRequest request, CancellationToken cancellationToken = default)
    {
        if (await _db.SubscriptionPlans.AnyAsync(p => p.Code == request.Code, cancellationToken))
            throw new ConflictException($"A plan with code '{request.Code}' already exists.");

        var plan = new SubscriptionPlan { Code = request.Code };
        Apply(plan, request);
        _db.SubscriptionPlans.Add(plan);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(plan);
    }

    public async Task<SubscriptionPlanDto> UpdateAsync(Guid id, UpsertSubscriptionPlanRequest request, CancellationToken cancellationToken = default)
    {
        var plan = await _db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("SubscriptionPlan", id);

        if (await _db.SubscriptionPlans.AnyAsync(p => p.Code == request.Code && p.Id != id, cancellationToken))
            throw new ConflictException($"A plan with code '{request.Code}' already exists.");

        plan.Code = request.Code;
        Apply(plan, request);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(plan);
    }

    private static void Apply(SubscriptionPlan plan, UpsertSubscriptionPlanRequest request)
    {
        plan.Name = request.Name;
        plan.Description = request.Description;
        plan.MonthlyPrice = request.MonthlyPrice;
        plan.YearlyPrice = request.YearlyPrice;
        plan.Currency = request.Currency;
        plan.MaxUsers = request.MaxUsers;
        plan.MaxEmployees = request.MaxEmployees;
        plan.MaxProducts = request.MaxProducts;
        plan.MaxCustomers = request.MaxCustomers;
        plan.MaxSuppliers = request.MaxSuppliers;
        plan.MaxMonthlyInvoices = request.MaxMonthlyInvoices;
        plan.MaxMonthlyQuotations = request.MaxMonthlyQuotations;
        plan.MaxMonthlyPrints = request.MaxMonthlyPrints;
        plan.MaxStorageMb = request.MaxStorageMb;
        plan.MaxWarehouses = request.MaxWarehouses;
        plan.CanExportPdf = request.CanExportPdf;
        plan.CanExportExcel = request.CanExportExcel;
        plan.CanPrint = request.CanPrint;
        plan.CanAddLogo = request.CanAddLogo;
        plan.CanAddGst = request.CanAddGst;
        plan.CanAddMultiBranch = request.CanAddMultiBranch;
        plan.CanUseApi = request.CanUseApi;
        plan.IsActive = request.IsActive;
        plan.SortOrder = request.SortOrder;
    }

    private static SubscriptionPlanDto Map(SubscriptionPlan p) => new(
        p.Id, p.Name, p.Code, p.Description, p.MonthlyPrice, p.YearlyPrice, p.Currency,
        p.MaxUsers, p.MaxEmployees, p.MaxProducts, p.MaxCustomers, p.MaxSuppliers,
        p.MaxMonthlyInvoices, p.MaxMonthlyQuotations, p.MaxMonthlyPrints, p.MaxStorageMb, p.MaxWarehouses,
        p.CanExportPdf, p.CanExportExcel, p.CanPrint, p.CanAddLogo, p.CanAddGst, p.CanAddMultiBranch, p.CanUseApi,
        p.IsActive, p.SortOrder);

    private static System.Linq.Expressions.Expression<Func<SubscriptionPlan, SubscriptionPlanDto>> ProjectToDto() => p => new SubscriptionPlanDto(
        p.Id, p.Name, p.Code, p.Description, p.MonthlyPrice, p.YearlyPrice, p.Currency,
        p.MaxUsers, p.MaxEmployees, p.MaxProducts, p.MaxCustomers, p.MaxSuppliers,
        p.MaxMonthlyInvoices, p.MaxMonthlyQuotations, p.MaxMonthlyPrints, p.MaxStorageMb, p.MaxWarehouses,
        p.CanExportPdf, p.CanExportExcel, p.CanPrint, p.CanAddLogo, p.CanAddGst, p.CanAddMultiBranch, p.CanUseApi,
        p.IsActive, p.SortOrder);
}

using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Incomes;
using Cart360.Domain.Entities.Finance;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class IncomeService : IIncomeService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public IncomeService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<IncomeCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default) =>
        await _db.IncomeCategories.OrderBy(c => c.Name).Select(c => new IncomeCategoryDto(c.Id, c.Name, c.IsActive)).ToListAsync(cancellationToken);

    public async Task<IncomeCategoryDto> CreateCategoryAsync(CreateIncomeCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();
        var category = new IncomeCategory { TenantId = tenantId, Name = request.Name, IsActive = true };
        _db.IncomeCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);
        return new IncomeCategoryDto(category.Id, category.Name, category.IsActive);
    }

    public async Task<PagedResult<IncomeDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Incomes.Include(i => i.IncomeCategory).OrderByDescending(i => i.IncomeDate).AsQueryable();
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(i => new IncomeDto(i.Id, i.IncomeCategoryId, i.IncomeCategory.Name, i.Amount, i.IncomeDate, i.Source, i.PaymentMethod, i.Notes, i.CreatedAt))
            .ToListAsync(cancellationToken);
        return PagedResult<IncomeDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public async Task<IncomeDto> CreateAsync(CreateIncomeRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var category = await _db.IncomeCategories.FirstOrDefaultAsync(c => c.Id == request.IncomeCategoryId, cancellationToken)
            ?? throw new NotFoundException("IncomeCategory", request.IncomeCategoryId);

        var income = new Income
        {
            TenantId = tenantId, IncomeCategoryId = category.Id, Amount = request.Amount, IncomeDate = request.IncomeDate,
            Source = request.Source, PaymentMethod = request.PaymentMethod, Notes = request.Notes
        };
        _db.Incomes.Add(income);
        await _db.SaveChangesAsync(cancellationToken);
        return new IncomeDto(income.Id, category.Id, category.Name, income.Amount, income.IncomeDate, income.Source, income.PaymentMethod, income.Notes, income.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var income = await _db.Incomes.FirstOrDefaultAsync(i => i.Id == id, cancellationToken) ?? throw new NotFoundException("Income", id);
        _db.Incomes.Remove(income);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Expenses;
using Cart360.Domain.Entities.Finance;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class ExpenseService : IExpenseService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public ExpenseService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<ExpenseCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default) =>
        await _db.ExpenseCategories.OrderBy(c => c.Name).Select(c => new ExpenseCategoryDto(c.Id, c.Name, c.IsActive)).ToListAsync(cancellationToken);

    public async Task<ExpenseCategoryDto> CreateCategoryAsync(CreateExpenseCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();
        var category = new ExpenseCategory { TenantId = tenantId, Name = request.Name, IsActive = true };
        _db.ExpenseCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);
        return new ExpenseCategoryDto(category.Id, category.Name, category.IsActive);
    }

    public async Task<PagedResult<ExpenseDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Expenses.Include(e => e.ExpenseCategory).OrderByDescending(e => e.ExpenseDate).AsQueryable();
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(e => new ExpenseDto(e.Id, e.ExpenseCategoryId, e.ExpenseCategory.Name, e.Amount, e.ExpenseDate, e.PaymentMethod, e.ReferenceNumber, e.Notes, e.CreatedAt))
            .ToListAsync(cancellationToken);
        return PagedResult<ExpenseDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var category = await _db.ExpenseCategories.FirstOrDefaultAsync(c => c.Id == request.ExpenseCategoryId, cancellationToken)
            ?? throw new NotFoundException("ExpenseCategory", request.ExpenseCategoryId);

        var expense = new Expense
        {
            TenantId = tenantId, ExpenseCategoryId = category.Id, Amount = request.Amount, ExpenseDate = request.ExpenseDate,
            PaymentMethod = request.PaymentMethod, ReferenceNumber = request.ReferenceNumber, Notes = request.Notes
        };
        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync(cancellationToken);
        return new ExpenseDto(expense.Id, category.Id, category.Name, expense.Amount, expense.ExpenseDate, expense.PaymentMethod, expense.ReferenceNumber, expense.Notes, expense.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken) ?? throw new NotFoundException("Expense", id);
        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

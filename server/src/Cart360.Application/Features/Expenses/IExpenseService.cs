using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Expenses;

public interface IExpenseService
{
    Task<IReadOnlyList<ExpenseCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<ExpenseCategoryDto> CreateCategoryAsync(CreateExpenseCategoryRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<ExpenseDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<ExpenseDto> CreateAsync(CreateExpenseRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

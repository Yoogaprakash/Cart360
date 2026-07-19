using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Incomes;

public interface IIncomeService
{
    Task<IReadOnlyList<IncomeCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IncomeCategoryDto> CreateCategoryAsync(CreateIncomeCategoryRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<IncomeDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<IncomeDto> CreateAsync(CreateIncomeRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

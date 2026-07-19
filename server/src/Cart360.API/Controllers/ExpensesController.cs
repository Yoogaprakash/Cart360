using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Expenses;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet("categories")]
    [RequirePermission(ModuleNames.Expenses, PermissionAction.View)]
    public async Task<ActionResult<IReadOnlyList<ExpenseCategoryDto>>> GetCategories(CancellationToken cancellationToken) =>
        Ok(await _expenseService.GetCategoriesAsync(cancellationToken));

    [HttpPost("categories")]
    [RequirePermission(ModuleNames.Expenses, PermissionAction.Create)]
    public async Task<ActionResult<ExpenseCategoryDto>> CreateCategory(CreateExpenseCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _expenseService.CreateCategoryAsync(request, cancellationToken));

    [HttpGet]
    [RequirePermission(ModuleNames.Expenses, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<ExpenseDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _expenseService.GetPagedAsync(request, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Expenses, PermissionAction.Create)]
    public async Task<ActionResult<ExpenseDto>> Create(CreateExpenseRequest request, CancellationToken cancellationToken) =>
        Ok(await _expenseService.CreateAsync(request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Expenses, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _expenseService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

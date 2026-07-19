using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Incomes;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/incomes")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class IncomesController : ControllerBase
{
    private readonly IIncomeService _incomeService;

    public IncomesController(IIncomeService incomeService)
    {
        _incomeService = incomeService;
    }

    [HttpGet("categories")]
    [RequirePermission(ModuleNames.Income, PermissionAction.View)]
    public async Task<ActionResult<IReadOnlyList<IncomeCategoryDto>>> GetCategories(CancellationToken cancellationToken) =>
        Ok(await _incomeService.GetCategoriesAsync(cancellationToken));

    [HttpPost("categories")]
    [RequirePermission(ModuleNames.Income, PermissionAction.Create)]
    public async Task<ActionResult<IncomeCategoryDto>> CreateCategory(CreateIncomeCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _incomeService.CreateCategoryAsync(request, cancellationToken));

    [HttpGet]
    [RequirePermission(ModuleNames.Income, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<IncomeDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _incomeService.GetPagedAsync(request, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Income, PermissionAction.Create)]
    public async Task<ActionResult<IncomeDto>> Create(CreateIncomeRequest request, CancellationToken cancellationToken) =>
        Ok(await _incomeService.CreateAsync(request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Income, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _incomeService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

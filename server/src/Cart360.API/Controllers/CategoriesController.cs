using Cart360.API.Filters;
using Cart360.Application.Features.Categories;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Categories, PermissionAction.View)]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _categoryService.GetAllAsync(cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Categories, PermissionAction.Create)]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _categoryService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Categories, PermissionAction.Edit)]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _categoryService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Categories, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _categoryService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

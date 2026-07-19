using Cart360.API.Filters;
using Cart360.Application.Features.Brands;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/brands")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Brands, PermissionAction.View)]
    public async Task<ActionResult<IReadOnlyList<BrandDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _brandService.GetAllAsync(cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Brands, PermissionAction.Create)]
    public async Task<ActionResult<BrandDto>> Create(CreateBrandRequest request, CancellationToken cancellationToken) =>
        Ok(await _brandService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Brands, PermissionAction.Edit)]
    public async Task<ActionResult<BrandDto>> Update(Guid id, UpdateBrandRequest request, CancellationToken cancellationToken) =>
        Ok(await _brandService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Brands, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _brandService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

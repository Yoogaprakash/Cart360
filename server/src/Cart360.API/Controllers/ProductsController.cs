using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Products;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/products")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Products, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _productService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.Products, PermissionAction.View)]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _productService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Products, PermissionAction.Create)]
    public async Task<ActionResult<ProductDto>> Create(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await _productService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Products, PermissionAction.Edit)]
    public async Task<ActionResult<ProductDto>> Update(Guid id, UpdateProductRequest request, CancellationToken cancellationToken) =>
        Ok(await _productService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Products, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _productService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

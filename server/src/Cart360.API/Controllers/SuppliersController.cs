using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Suppliers;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Suppliers, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<SupplierDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _supplierService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.Suppliers, PermissionAction.View)]
    public async Task<ActionResult<SupplierDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _supplierService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Suppliers, PermissionAction.Create)]
    public async Task<ActionResult<SupplierDto>> Create(CreateSupplierRequest request, CancellationToken cancellationToken)
    {
        var result = await _supplierService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Suppliers, PermissionAction.Edit)]
    public async Task<ActionResult<SupplierDto>> Update(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken) =>
        Ok(await _supplierService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Suppliers, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _supplierService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

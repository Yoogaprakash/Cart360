using Cart360.API.Filters;
using Cart360.Application.Features.Warehouses;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/warehouses")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Warehouses, PermissionAction.View)]
    public async Task<ActionResult<IReadOnlyList<WarehouseDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _warehouseService.GetAllAsync(cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Warehouses, PermissionAction.Create)]
    public async Task<ActionResult<WarehouseDto>> Create(CreateWarehouseRequest request, CancellationToken cancellationToken) =>
        Ok(await _warehouseService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Warehouses, PermissionAction.Edit)]
    public async Task<ActionResult<WarehouseDto>> Update(Guid id, UpdateWarehouseRequest request, CancellationToken cancellationToken) =>
        Ok(await _warehouseService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Warehouses, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _warehouseService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

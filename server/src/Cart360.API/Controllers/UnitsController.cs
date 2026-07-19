using Cart360.API.Filters;
using Cart360.Application.Features.Units;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/units")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class UnitsController : ControllerBase
{
    private readonly IUnitService _unitService;

    public UnitsController(IUnitService unitService)
    {
        _unitService = unitService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Units, PermissionAction.View)]
    public async Task<ActionResult<IReadOnlyList<UnitDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _unitService.GetAllAsync(cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Units, PermissionAction.Create)]
    public async Task<ActionResult<UnitDto>> Create(CreateUnitRequest request, CancellationToken cancellationToken) =>
        Ok(await _unitService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Units, PermissionAction.Edit)]
    public async Task<ActionResult<UnitDto>> Update(Guid id, UpdateUnitRequest request, CancellationToken cancellationToken) =>
        Ok(await _unitService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Units, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _unitService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

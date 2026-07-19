using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.StockAdjustments;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/stock-adjustments")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class StockAdjustmentsController : ControllerBase
{
    private readonly IStockAdjustmentService _stockAdjustmentService;

    public StockAdjustmentsController(IStockAdjustmentService stockAdjustmentService)
    {
        _stockAdjustmentService = stockAdjustmentService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.StockAdjustments, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<StockAdjustmentDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _stockAdjustmentService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.StockAdjustments, PermissionAction.View)]
    public async Task<ActionResult<StockAdjustmentDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _stockAdjustmentService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.StockAdjustments, PermissionAction.Create)]
    public async Task<ActionResult<StockAdjustmentDto>> Create(CreateStockAdjustmentRequest request, CancellationToken cancellationToken)
    {
        var result = await _stockAdjustmentService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}

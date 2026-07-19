using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Returns;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/purchase-returns")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class PurchaseReturnsController : ControllerBase
{
    private readonly IPurchaseReturnService _purchaseReturnService;

    public PurchaseReturnsController(IPurchaseReturnService purchaseReturnService)
    {
        _purchaseReturnService = purchaseReturnService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.PurchaseReturns, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<PurchaseReturnDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _purchaseReturnService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.PurchaseReturns, PermissionAction.View)]
    public async Task<ActionResult<PurchaseReturnDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _purchaseReturnService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.PurchaseReturns, PermissionAction.Create)]
    public async Task<ActionResult<PurchaseReturnDto>> Create(CreatePurchaseReturnRequest request, CancellationToken cancellationToken)
    {
        var result = await _purchaseReturnService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}

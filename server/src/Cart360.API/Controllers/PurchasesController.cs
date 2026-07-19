using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Purchases;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/purchases")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class PurchasesController : ControllerBase
{
    private readonly IPurchaseService _purchaseService;

    public PurchasesController(IPurchaseService purchaseService)
    {
        _purchaseService = purchaseService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Purchases, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<PurchaseDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _purchaseService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.Purchases, PermissionAction.View)]
    public async Task<ActionResult<PurchaseDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _purchaseService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Purchases, PermissionAction.Create)]
    public async Task<ActionResult<PurchaseDto>> Create(CreatePurchaseRequest request, CancellationToken cancellationToken)
    {
        var result = await _purchaseService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/payments")]
    [RequirePermission(ModuleNames.Purchases, PermissionAction.Edit)]
    public async Task<ActionResult<PurchaseDto>> RecordPayment(Guid id, RecordPurchasePaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await _purchaseService.RecordPaymentAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/cancel")]
    [RequirePermission(ModuleNames.Purchases, PermissionAction.Delete)]
    public async Task<ActionResult<PurchaseDto>> Cancel(Guid id, CancellationToken cancellationToken) =>
        Ok(await _purchaseService.CancelAsync(id, cancellationToken));
}

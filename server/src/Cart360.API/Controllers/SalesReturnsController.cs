using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Returns;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/sales-returns")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class SalesReturnsController : ControllerBase
{
    private readonly ISalesReturnService _salesReturnService;

    public SalesReturnsController(ISalesReturnService salesReturnService)
    {
        _salesReturnService = salesReturnService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.SalesReturns, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<SalesReturnDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _salesReturnService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.SalesReturns, PermissionAction.View)]
    public async Task<ActionResult<SalesReturnDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _salesReturnService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.SalesReturns, PermissionAction.Create)]
    public async Task<ActionResult<SalesReturnDto>> Create(CreateSalesReturnRequest request, CancellationToken cancellationToken)
    {
        var result = await _salesReturnService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}

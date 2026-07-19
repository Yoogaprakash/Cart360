using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Invoices;
using Cart360.Application.Features.Quotations;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/quotations")]
[Authorize(Roles = "CompanyAdmin,Employee,CompanyUser")]
public class QuotationsController : ControllerBase
{
    private readonly IQuotationService _quotationService;

    public QuotationsController(IQuotationService quotationService)
    {
        _quotationService = quotationService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Quotations, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<QuotationDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _quotationService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.Quotations, PermissionAction.View)]
    public async Task<ActionResult<QuotationDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _quotationService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = "CompanyAdmin,Employee")]
    [RequirePermission(ModuleNames.Quotations, PermissionAction.Create)]
    public async Task<ActionResult<QuotationDto>> Create(CreateQuotationRequest request, CancellationToken cancellationToken)
    {
        var result = await _quotationService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "CompanyAdmin,Employee")]
    [RequirePermission(ModuleNames.Quotations, PermissionAction.Edit)]
    public async Task<ActionResult<QuotationDto>> UpdateStatus(Guid id, UpdateQuotationStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await _quotationService.UpdateStatusAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/convert-to-invoice")]
    [Authorize(Roles = "CompanyAdmin,Employee")]
    [RequirePermission(ModuleNames.Quotations, PermissionAction.Edit)]
    public async Task<ActionResult<InvoiceDto>> ConvertToInvoice(Guid id, CancellationToken cancellationToken) =>
        Ok(await _quotationService.ConvertToInvoiceAsync(id, cancellationToken));
}

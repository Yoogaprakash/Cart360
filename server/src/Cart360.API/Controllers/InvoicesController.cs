using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Invoices;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize(Roles = "CompanyAdmin,Employee,CompanyUser")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Invoices, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<InvoiceDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _invoiceService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.Invoices, PermissionAction.View)]
    public async Task<ActionResult<InvoiceDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _invoiceService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = "CompanyAdmin,Employee")]
    [RequirePermission(ModuleNames.Invoices, PermissionAction.Create)]
    public async Task<ActionResult<InvoiceDto>> Create(CreateInvoiceRequest request, CancellationToken cancellationToken)
    {
        var result = await _invoiceService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/payments")]
    [Authorize(Roles = "CompanyAdmin,Employee")]
    [RequirePermission(ModuleNames.Invoices, PermissionAction.Edit)]
    public async Task<ActionResult<InvoiceDto>> RecordPayment(Guid id, RecordInvoicePaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await _invoiceService.RecordPaymentAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "CompanyAdmin,Employee")]
    [RequirePermission(ModuleNames.Invoices, PermissionAction.Delete)]
    public async Task<ActionResult<InvoiceDto>> Cancel(Guid id, CancellationToken cancellationToken) =>
        Ok(await _invoiceService.CancelAsync(id, cancellationToken));

    [HttpPost("{id:guid}/print")]
    [Authorize(Roles = "CompanyAdmin,Employee,CompanyUser")]
    [RequirePermission(ModuleNames.Invoices, PermissionAction.Print)]
    public async Task<ActionResult<InvoiceDto>> RegisterPrint(Guid id, CancellationToken cancellationToken) =>
        Ok(await _invoiceService.IncrementPrintCountAsync(id, cancellationToken));
}

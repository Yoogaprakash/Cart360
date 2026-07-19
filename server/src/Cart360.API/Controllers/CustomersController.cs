using Cart360.API.Filters;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Customers;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Roles = "CompanyAdmin,Employee")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    [RequirePermission(ModuleNames.Customers, PermissionAction.View)]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _customerService.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [RequirePermission(ModuleNames.Customers, PermissionAction.View)]
    public async Task<ActionResult<CustomerDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _customerService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [RequirePermission(ModuleNames.Customers, PermissionAction.Create)]
    public async Task<ActionResult<CustomerDto>> Create(CreateCustomerRequest request, CancellationToken cancellationToken)
    {
        var result = await _customerService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(ModuleNames.Customers, PermissionAction.Edit)]
    public async Task<ActionResult<CustomerDto>> Update(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken) =>
        Ok(await _customerService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [RequirePermission(ModuleNames.Customers, PermissionAction.Delete)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _customerService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

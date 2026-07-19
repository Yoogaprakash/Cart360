using Cart360.Application.Common.Models;
using Cart360.Application.Features.Tenants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers.Admin;

/// <summary>Super Admin only — approve/suspend/reject/delete companies and manage their subscription plan.</summary>
[ApiController]
[Route("api/admin/companies")]
[Authorize(Roles = "SuperAdmin")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CompanyListItemDto>>> GetPaged([FromQuery] PagedRequest request, CancellationToken cancellationToken) =>
        Ok(await _companyService.GetPagedCompaniesAsync(request, cancellationToken));

    [HttpGet("{tenantId:guid}")]
    public async Task<ActionResult<CompanyDetailDto>> GetById(Guid tenantId, CancellationToken cancellationToken) =>
        Ok(await _companyService.GetCompanyDetailAsync(tenantId, cancellationToken));

    [HttpPost("{tenantId:guid}/approve")]
    public async Task<IActionResult> Approve(Guid tenantId, CancellationToken cancellationToken)
    {
        await _companyService.ApproveCompanyAsync(tenantId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{tenantId:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid tenantId, SuspendCompanyRequest request, CancellationToken cancellationToken)
    {
        await _companyService.SuspendCompanyAsync(tenantId, request, cancellationToken);
        return NoContent();
    }

    [HttpPost("{tenantId:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid tenantId, CancellationToken cancellationToken)
    {
        await _companyService.ReactivateCompanyAsync(tenantId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{tenantId:guid}/reject")]
    public async Task<IActionResult> Reject(Guid tenantId, RejectCompanyRequest request, CancellationToken cancellationToken)
    {
        await _companyService.RejectCompanyAsync(tenantId, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{tenantId:guid}")]
    public async Task<IActionResult> Delete(Guid tenantId, CancellationToken cancellationToken)
    {
        await _companyService.DeleteCompanyAsync(tenantId, cancellationToken);
        return NoContent();
    }

    [HttpPut("{tenantId:guid}/plan")]
    public async Task<IActionResult> ChangePlan(Guid tenantId, ChangeCompanyPlanRequest request, CancellationToken cancellationToken)
    {
        await _companyService.ChangePlanAsync(tenantId, request, cancellationToken);
        return NoContent();
    }
}

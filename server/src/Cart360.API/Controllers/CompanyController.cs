using Cart360.API.Extensions;
using Cart360.Application.Features.Tenants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

/// <summary>Company self-service — view/update this tenant's own company settings.</summary>
[ApiController]
[Route("api/company")]
[Authorize(Roles = "CompanyAdmin,Employee,CompanyUser")]
public class CompanyController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompanyController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    /// <summary>
    /// Readable by every tenant role (not just CompanyAdmin) — Employees and
    /// CompanyUsers need the company's logo/GST/bank/terms to render invoice
    /// and quotation prints, even though only a CompanyAdmin can edit them.
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<CompanyDetailDto>> GetMyCompany(CancellationToken cancellationToken) =>
        Ok(await _companyService.GetMyCompanyAsync(User.GetTenantId(), cancellationToken));

    [HttpPut("me")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> UpdateMyCompany(UpdateCompanySettingsRequest request, CancellationToken cancellationToken)
    {
        await _companyService.UpdateMyCompanyAsync(User.GetTenantId(), request, cancellationToken);
        return NoContent();
    }
}

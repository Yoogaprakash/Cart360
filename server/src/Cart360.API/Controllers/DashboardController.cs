using Cart360.API.Extensions;
using Cart360.Application.Features.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "CompanyAdmin,Employee,CompanyUser")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(CancellationToken cancellationToken) =>
        Ok(await _dashboardService.GetSummaryAsync(User.GetTenantId(), cancellationToken));
}

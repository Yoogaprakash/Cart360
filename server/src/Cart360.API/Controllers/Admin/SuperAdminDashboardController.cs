using Cart360.Application.Features.SuperAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminDashboardController : ControllerBase
{
    private readonly ISuperAdminService _superAdminService;

    public SuperAdminDashboardController(ISuperAdminService superAdminService)
    {
        _superAdminService = superAdminService;
    }

    [HttpGet]
    public async Task<ActionResult<SuperAdminDashboardDto>> Get(CancellationToken cancellationToken) =>
        Ok(await _superAdminService.GetDashboardAsync(cancellationToken));
}

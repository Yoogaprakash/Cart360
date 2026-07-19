using Cart360.Application.Features.SuperAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers.Admin;

[ApiController]
[Route("api/admin/plans")]
[Authorize(Roles = "SuperAdmin")]
public class SubscriptionPlansController : ControllerBase
{
    private readonly ISubscriptionPlanAdminService _planService;

    public SubscriptionPlansController(ISubscriptionPlanAdminService planService)
    {
        _planService = planService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SubscriptionPlanDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _planService.GetAllAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<SubscriptionPlanDto>> Create(UpsertSubscriptionPlanRequest request, CancellationToken cancellationToken) =>
        Ok(await _planService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SubscriptionPlanDto>> Update(Guid id, UpsertSubscriptionPlanRequest request, CancellationToken cancellationToken) =>
        Ok(await _planService.UpdateAsync(id, request, cancellationToken));
}

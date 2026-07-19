using Cart360.Application.Features.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "CompanyAdmin")]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public UsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CompanyUserDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _userManagementService.GetAllAsync(cancellationToken));

    [HttpPost("invite")]
    public async Task<ActionResult<CompanyUserDto>> Invite(InviteUserRequest request, CancellationToken cancellationToken) =>
        Ok(await _userManagementService.InviteAsync(request, cancellationToken));

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<CompanyUserDto>> UpdateStatus(Guid id, UpdateUserStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await _userManagementService.UpdateStatusAsync(id, request, cancellationToken));

    [HttpPut("{id:guid}/permissions")]
    public async Task<ActionResult<CompanyUserDto>> SetPermissions(Guid id, SetUserPermissionsRequest request, CancellationToken cancellationToken) =>
        Ok(await _userManagementService.SetPermissionsAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _userManagementService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

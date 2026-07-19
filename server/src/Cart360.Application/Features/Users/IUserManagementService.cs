namespace Cart360.Application.Features.Users;

public interface IUserManagementService
{
    Task<IReadOnlyList<CompanyUserDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CompanyUserDto> InviteAsync(InviteUserRequest request, CancellationToken cancellationToken = default);
    Task<CompanyUserDto> UpdateStatusAsync(Guid userId, UpdateUserStatusRequest request, CancellationToken cancellationToken = default);
    Task<CompanyUserDto> SetPermissionsAsync(Guid userId, SetUserPermissionsRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, CancellationToken cancellationToken = default);
}

using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Users;

public record UserPermissionDto(string Module, bool CanView, bool CanCreate, bool CanEdit, bool CanDelete, bool CanPrint, bool CanExport);

public record CompanyUserDto(
    Guid Id, string FirstName, string? LastName, string Email, string? Phone, UserRole Role,
    bool IsActive, bool IsEmailVerified, DateTimeOffset? LastLoginAt,
    IReadOnlyCollection<UserPermissionDto> Permissions);

public record InviteUserRequest(string FirstName, string? LastName, string Email, string? Phone, UserRole Role, string TemporaryPassword);

public record UpdateUserStatusRequest(bool IsActive);

public record SetUserPermissionsRequest(IReadOnlyCollection<UserPermissionDto> Permissions);

using Cart360.Domain.Enums;

namespace Cart360.Application.Common.Interfaces;

/// <summary>Identity of the caller making the current request, resolved from the validated JWT.</summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}

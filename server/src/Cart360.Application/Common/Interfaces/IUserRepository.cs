using Cart360.Domain.Entities.Identity;

namespace Cart360.Application.Common.Interfaces;

public interface IUserRepository
{
    /// <summary>
    /// Looks up a user by email across all tenants (bypassing the tenant query filter —
    /// this is the one place that's correct, since login/registration run before any
    /// tenant is known). Still excludes soft-deleted users.
    /// </summary>
    Task<User?> GetByEmailAnyTenantAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(Guid? tenantId, string email, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);
}

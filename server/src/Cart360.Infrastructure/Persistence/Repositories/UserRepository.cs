using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly Cart360DbContext _db;

    public UserRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByEmailAnyTenantAsync(string email, CancellationToken cancellationToken = default) =>
        _db.Users.IgnoreQueryFilters().Include(u => u.Permissions)
            .Where(u => !u.IsDeleted)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task<IReadOnlyList<User>> GetAllByEmailAnyTenantAsync(string email, CancellationToken cancellationToken = default) =>
        await _db.Users.IgnoreQueryFilters().Include(u => u.Permissions)
            .Where(u => !u.IsDeleted && u.Email == email)
            .ToListAsync(cancellationToken);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Users.IgnoreQueryFilters().Include(u => u.Permissions)
            .Where(u => !u.IsDeleted)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<bool> EmailExistsAsync(Guid? tenantId, string email, CancellationToken cancellationToken = default) =>
        _db.Users.IgnoreQueryFilters()
            .AnyAsync(u => !u.IsDeleted && u.TenantId == tenantId && u.Email == email, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default) =>
        await _db.Users.AddAsync(user, cancellationToken);
}

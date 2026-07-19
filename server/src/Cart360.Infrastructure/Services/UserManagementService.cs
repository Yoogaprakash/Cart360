using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Features.Users;
using Cart360.Domain.Entities.Identity;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class UserManagementService : IUserManagementService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ISubscriptionLimitService _limitService;

    public UserManagementService(Cart360DbContext db, ITenantContext tenantContext, IPasswordHasher passwordHasher, ISubscriptionLimitService limitService)
    {
        _db = db;
        _tenantContext = tenantContext;
        _passwordHasher = passwordHasher;
        _limitService = limitService;
    }

    public async Task<IReadOnlyList<CompanyUserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        // Materialize first, then map in memory — MapUser's object-construction logic can't
        // be translated to SQL by EF Core if chained directly onto the IQueryable.
        var users = await _db.Users.Include(u => u.Permissions).OrderBy(u => u.FirstName).ToListAsync(cancellationToken);
        return users.Select(MapUser).ToList();
    }

    public async Task<CompanyUserDto> InviteAsync(InviteUserRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.Users, 1, cancellationToken);
        if (request.Role == UserRole.Employee)
            await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.Employees, 1, cancellationToken);

        if (await _db.Users.AnyAsync(u => u.TenantId == tenantId && u.Email == request.Email, cancellationToken))
            throw new ConflictException("A user with this email already exists in your company.");

        var user = new User
        {
            TenantId = tenantId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Role = request.Role,
            PasswordHash = _passwordHasher.Hash(request.TemporaryPassword),
            IsEmailVerified = true,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);
        return MapUser(user);
    }

    public async Task<CompanyUserDto> UpdateStatusAsync(Guid userId, UpdateUserStatusRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.Include(u => u.Permissions).FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        if (user.Role == UserRole.CompanyAdmin)
            throw new ForbiddenAccessException("The Company Admin account cannot be deactivated.");

        user.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return MapUser(user);
    }

    public async Task<CompanyUserDto> SetPermissionsAsync(Guid userId, SetUserPermissionsRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.Include(u => u.Permissions).FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        if (user.Role != UserRole.Employee)
            throw new ConflictException("Granular module permissions only apply to Employee accounts.");

        _db.UserPermissions.RemoveRange(user.Permissions);

        foreach (var p in request.Permissions)
        {
            user.Permissions.Add(new UserPermission
            {
                UserId = user.Id,
                Module = p.Module,
                CanView = p.CanView,
                CanCreate = p.CanCreate,
                CanEdit = p.CanEdit,
                CanDelete = p.CanDelete,
                CanPrint = p.CanPrint,
                CanExport = p.CanExport
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
        return MapUser(user);
    }

    public async Task DeleteAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        if (user.Role == UserRole.CompanyAdmin)
            throw new ForbiddenAccessException("The Company Admin account cannot be removed.");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private static CompanyUserDto MapUser(User u) => new(
        u.Id, u.FirstName, u.LastName, u.Email, u.Phone, u.Role, u.IsActive, u.IsEmailVerified, u.LastLoginAt,
        u.Permissions.Select(p => new UserPermissionDto(p.Module, p.CanView, p.CanCreate, p.CanEdit, p.CanDelete, p.CanPrint, p.CanExport)).ToList());
}

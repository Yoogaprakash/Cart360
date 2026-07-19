using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Features.Units;
using Cart360.Domain.Entities.Catalog;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class UnitService : IUnitService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public UnitService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<UnitDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Units
            .OrderBy(u => u.Name)
            .Select(u => new UnitDto(u.Id, u.Name, u.ShortCode, u.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<UnitDto> CreateAsync(CreateUnitRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        if (await _db.Units.AnyAsync(u => u.ShortCode == request.ShortCode, cancellationToken))
            throw new ConflictException($"A unit with short code '{request.ShortCode}' already exists.");

        var unit = new Unit { TenantId = tenantId, Name = request.Name, ShortCode = request.ShortCode, IsActive = true };
        _db.Units.Add(unit);
        await _db.SaveChangesAsync(cancellationToken);

        return new UnitDto(unit.Id, unit.Name, unit.ShortCode, unit.IsActive);
    }

    public async Task<UnitDto> UpdateAsync(Guid id, UpdateUnitRequest request, CancellationToken cancellationToken = default)
    {
        var unit = await _db.Units.FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new NotFoundException("Unit", id);

        if (await _db.Units.AnyAsync(u => u.ShortCode == request.ShortCode && u.Id != id, cancellationToken))
            throw new ConflictException($"A unit with short code '{request.ShortCode}' already exists.");

        unit.Name = request.Name;
        unit.ShortCode = request.ShortCode;
        unit.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);

        return new UnitDto(unit.Id, unit.Name, unit.ShortCode, unit.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var unit = await _db.Units.FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new NotFoundException("Unit", id);

        _db.Units.Remove(unit);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

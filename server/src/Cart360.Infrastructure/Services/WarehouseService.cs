using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Features.Warehouses;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class WarehouseService : IWarehouseService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly ISubscriptionLimitService _limitService;

    public WarehouseService(Cart360DbContext db, ITenantContext tenantContext, ISubscriptionLimitService limitService)
    {
        _db = db;
        _tenantContext = tenantContext;
        _limitService = limitService;
    }

    public async Task<IReadOnlyList<WarehouseDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Warehouses.OrderBy(w => w.Name)
            .Select(w => new WarehouseDto(w.Id, w.Name, w.Code, w.Address, w.IsDefault, w.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<WarehouseDto> CreateAsync(CreateWarehouseRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();
        await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.Warehouses, 1, cancellationToken);

        if (await _db.Warehouses.AnyAsync(w => w.Code == request.Code, cancellationToken))
            throw new ConflictException($"A warehouse with code '{request.Code}' already exists.");

        if (request.IsDefault)
            await ClearExistingDefaultAsync(cancellationToken);

        var warehouse = new Warehouse
        {
            TenantId = tenantId, Name = request.Name, Code = request.Code,
            Address = request.Address, IsDefault = request.IsDefault, IsActive = true
        };
        _db.Warehouses.Add(warehouse);
        await _db.SaveChangesAsync(cancellationToken);
        return new WarehouseDto(warehouse.Id, warehouse.Name, warehouse.Code, warehouse.Address, warehouse.IsDefault, warehouse.IsActive);
    }

    public async Task<WarehouseDto> UpdateAsync(Guid id, UpdateWarehouseRequest request, CancellationToken cancellationToken = default)
    {
        var warehouse = await _db.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken)
            ?? throw new NotFoundException("Warehouse", id);

        if (await _db.Warehouses.AnyAsync(w => w.Code == request.Code && w.Id != id, cancellationToken))
            throw new ConflictException($"A warehouse with code '{request.Code}' already exists.");

        if (request.IsDefault && !warehouse.IsDefault)
            await ClearExistingDefaultAsync(cancellationToken);

        warehouse.Name = request.Name;
        warehouse.Code = request.Code;
        warehouse.Address = request.Address;
        warehouse.IsDefault = request.IsDefault;
        warehouse.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return new WarehouseDto(warehouse.Id, warehouse.Name, warehouse.Code, warehouse.Address, warehouse.IsDefault, warehouse.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _db.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken)
            ?? throw new NotFoundException("Warehouse", id);
        _db.Warehouses.Remove(warehouse);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task ClearExistingDefaultAsync(CancellationToken cancellationToken)
    {
        var currentDefaults = await _db.Warehouses.Where(w => w.IsDefault).ToListAsync(cancellationToken);
        foreach (var w in currentDefaults) w.IsDefault = false;
    }
}

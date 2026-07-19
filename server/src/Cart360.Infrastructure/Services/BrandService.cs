using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Features.Brands;
using Cart360.Domain.Entities.Catalog;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class BrandService : IBrandService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public BrandService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Brands.OrderBy(b => b.Name).Select(b => new BrandDto(b.Id, b.Name, b.Description, b.IsActive)).ToListAsync(cancellationToken);

    public async Task<BrandDto> CreateAsync(CreateBrandRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();
        var brand = new Brand { TenantId = tenantId, Name = request.Name, Description = request.Description, IsActive = true };
        _db.Brands.Add(brand);
        await _db.SaveChangesAsync(cancellationToken);
        return new BrandDto(brand.Id, brand.Name, brand.Description, brand.IsActive);
    }

    public async Task<BrandDto> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken cancellationToken = default)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken) ?? throw new NotFoundException("Brand", id);
        brand.Name = request.Name;
        brand.Description = request.Description;
        brand.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return new BrandDto(brand.Id, brand.Name, brand.Description, brand.IsActive);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken) ?? throw new NotFoundException("Brand", id);
        _db.Brands.Remove(brand);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

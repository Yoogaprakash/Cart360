using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Products;
using Cart360.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly Cart360DbContext _db;

    public ProductRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ProductDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        // No IgnoreQueryFilters here — relies on the DbContext's tenant + soft-delete
        // global query filter, exactly as every ordinary authenticated-request query should.
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{search}%") ||
                EF.Functions.ILike(p.Sku, $"%{search}%") ||
                (p.Barcode != null && EF.Functions.ILike(p.Barcode, $"%{search}%")));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "sku" => request.SortDescending ? query.OrderByDescending(p => p.Sku) : query.OrderBy(p => p.Sku),
            "stock" => request.SortDescending ? query.OrderByDescending(p => p.CurrentStock) : query.OrderBy(p => p.CurrentStock),
            "price" => request.SortDescending ? query.OrderByDescending(p => p.SellingPrice) : query.OrderBy(p => p.SellingPrice),
            _ => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(ProjectToDto())
            .ToListAsync(cancellationToken);

        return PagedResult<ProductDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public Task<ProductDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Products.Where(p => p.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken);

    public Task<Product?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null, CancellationToken cancellationToken = default) =>
        _db.Products.AnyAsync(p => p.Sku == sku && p.Id != excludeId, cancellationToken);

    public Task<bool> UnitExistsAsync(Guid unitId, CancellationToken cancellationToken = default) =>
        _db.Units.AnyAsync(u => u.Id == unitId, cancellationToken);

    public Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken = default) =>
        _db.Categories.AnyAsync(c => c.Id == categoryId, cancellationToken);

    public Task<bool> BrandExistsAsync(Guid brandId, CancellationToken cancellationToken = default) =>
        _db.Brands.AnyAsync(b => b.Id == brandId, cancellationToken);

    public Task<bool> WarehouseExistsAsync(Guid warehouseId, CancellationToken cancellationToken = default) =>
        _db.Warehouses.AnyAsync(w => w.Id == warehouseId, cancellationToken);

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default) =>
        await _db.Products.AddAsync(product, cancellationToken);

    public void Remove(Product product) => _db.Products.Remove(product);

    private static System.Linq.Expressions.Expression<Func<Product, ProductDto>> ProjectToDto() => p => new ProductDto(
        p.Id,
        p.CategoryId,
        p.Category != null ? p.Category.Name : null,
        p.BrandId,
        p.Brand != null ? p.Brand.Name : null,
        p.UnitId,
        p.Unit.Name,
        p.WarehouseId,
        p.Warehouse != null ? p.Warehouse.Name : null,
        p.Name,
        p.Sku,
        p.Barcode,
        p.HsnCode,
        p.GstPercent,
        p.CgstPercent,
        p.SgstPercent,
        p.IgstPercent,
        p.PurchasePrice,
        p.SellingPrice,
        p.Mrp,
        p.OpeningStock,
        p.CurrentStock,
        p.MinStockLevel,
        p.MaxStockLevel,
        p.TrackInventory,
        p.TrackBatches,
        p.ImageUrl,
        p.IsActive,
        p.TrackInventory && p.CurrentStock <= p.MinStockLevel,
        p.CreatedAt,
        p.UpdatedAt);
}

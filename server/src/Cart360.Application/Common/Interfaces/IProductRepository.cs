using Cart360.Application.Common.Models;
using Cart360.Application.Features.Products;
using Cart360.Domain.Entities.Catalog;

namespace Cart360.Application.Common.Interfaces;

public interface IProductRepository
{
    Task<PagedResult<ProductDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Product?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> UnitExistsAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<bool> BrandExistsAsync(Guid brandId, CancellationToken cancellationToken = default);
    Task<bool> WarehouseExistsAsync(Guid warehouseId, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    void Remove(Product product);
}

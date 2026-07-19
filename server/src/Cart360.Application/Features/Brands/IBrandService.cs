namespace Cart360.Application.Features.Brands;

public interface IBrandService
{
    Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BrandDto> CreateAsync(CreateBrandRequest request, CancellationToken cancellationToken = default);
    Task<BrandDto> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

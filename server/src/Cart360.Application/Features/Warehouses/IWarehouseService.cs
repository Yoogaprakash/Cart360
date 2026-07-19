namespace Cart360.Application.Features.Warehouses;

public interface IWarehouseService
{
    Task<IReadOnlyList<WarehouseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<WarehouseDto> CreateAsync(CreateWarehouseRequest request, CancellationToken cancellationToken = default);
    Task<WarehouseDto> UpdateAsync(Guid id, UpdateWarehouseRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

namespace Cart360.Application.Features.Units;

public interface IUnitService
{
    Task<IReadOnlyList<UnitDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UnitDto> CreateAsync(CreateUnitRequest request, CancellationToken cancellationToken = default);
    Task<UnitDto> UpdateAsync(Guid id, UpdateUnitRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

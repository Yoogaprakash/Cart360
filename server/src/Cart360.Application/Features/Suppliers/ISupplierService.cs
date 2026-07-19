using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Suppliers;

public interface ISupplierService
{
    Task<PagedResult<SupplierDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

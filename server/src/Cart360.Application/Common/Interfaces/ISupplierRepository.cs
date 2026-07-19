using Cart360.Application.Common.Models;
using Cart360.Application.Features.Suppliers;
using Cart360.Domain.Entities.Purchasing;

namespace Cart360.Application.Common.Interfaces;

public interface ISupplierRepository
{
    Task<PagedResult<SupplierDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Supplier?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextSupplierCodeAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Supplier supplier, CancellationToken cancellationToken = default);
    void Remove(Supplier supplier);
}

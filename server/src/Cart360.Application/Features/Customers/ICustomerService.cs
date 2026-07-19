using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Customers;

public interface ICustomerService
{
    Task<PagedResult<CustomerDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<CustomerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<CustomerDto> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

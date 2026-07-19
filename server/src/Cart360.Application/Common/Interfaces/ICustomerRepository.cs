using Cart360.Application.Common.Models;
using Cart360.Application.Features.Customers;
using Cart360.Domain.Entities.Sales;

namespace Cart360.Application.Common.Interfaces;

public interface ICustomerRepository
{
    Task<PagedResult<CustomerDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<CustomerDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Customer?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<string> GenerateNextCustomerCodeAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Customer customer, CancellationToken cancellationToken = default);
    void Remove(Customer customer);
}

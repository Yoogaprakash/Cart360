using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Customers;
using Cart360.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly Cart360DbContext _db;

    public CustomerRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<CustomerDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(c =>
                EF.Functions.ILike(c.Name, $"%{search}%") ||
                EF.Functions.ILike(c.CustomerCode, $"%{search}%") ||
                (c.Phone != null && EF.Functions.ILike(c.Phone, $"%{search}%")));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "outstanding" => request.SortDescending ? query.OrderByDescending(c => c.OutstandingAmount) : query.OrderBy(c => c.OutstandingAmount),
            _ => request.SortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(ProjectToDto())
            .ToListAsync(cancellationToken);

        return PagedResult<CustomerDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public Task<CustomerDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Customers.Where(c => c.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken);

    public Task<Customer?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Customers.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task<string> GenerateNextCustomerCodeAsync(CancellationToken cancellationToken = default)
    {
        var count = await _db.Customers.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"CUS-{count + 1:D4}";
    }

    public async Task AddAsync(Customer customer, CancellationToken cancellationToken = default) =>
        await _db.Customers.AddAsync(customer, cancellationToken);

    public void Remove(Customer customer) => _db.Customers.Remove(customer);

    private static System.Linq.Expressions.Expression<Func<Customer, CustomerDto>> ProjectToDto() => c => new CustomerDto(
        c.Id, c.CustomerCode, c.Name, c.GstNumber, c.Phone, c.Email,
        c.AddressLine1, c.AddressLine2, c.City, c.State, c.PostalCode,
        c.OutstandingAmount, c.CreditLimit, c.Notes, c.IsActive, c.CreatedAt);
}

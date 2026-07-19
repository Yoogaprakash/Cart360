using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Suppliers;
using Cart360.Domain.Entities.Purchasing;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class SupplierRepository : ISupplierRepository
{
    private readonly Cart360DbContext _db;

    public SupplierRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<SupplierDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Suppliers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(s =>
                EF.Functions.ILike(s.Name, $"%{search}%") ||
                EF.Functions.ILike(s.SupplierCode, $"%{search}%"));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "outstanding" => request.SortDescending ? query.OrderByDescending(s => s.OutstandingAmount) : query.OrderBy(s => s.OutstandingAmount),
            _ => request.SortDescending ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(ProjectToDto()).ToListAsync(cancellationToken);
        return PagedResult<SupplierDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public Task<SupplierDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Suppliers.Where(s => s.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken);

    public Task<Supplier?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Suppliers.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<string> GenerateNextSupplierCodeAsync(CancellationToken cancellationToken = default)
    {
        var count = await _db.Suppliers.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"SUP-{count + 1:D4}";
    }

    public async Task AddAsync(Supplier supplier, CancellationToken cancellationToken = default) =>
        await _db.Suppliers.AddAsync(supplier, cancellationToken);

    public void Remove(Supplier supplier) => _db.Suppliers.Remove(supplier);

    private static System.Linq.Expressions.Expression<Func<Supplier, SupplierDto>> ProjectToDto() => s => new SupplierDto(
        s.Id, s.SupplierCode, s.Name, s.GstNumber, s.Phone, s.Email,
        s.AddressLine1, s.AddressLine2, s.City, s.State, s.PostalCode,
        s.OutstandingAmount, s.Notes, s.IsActive, s.CreatedAt);
}

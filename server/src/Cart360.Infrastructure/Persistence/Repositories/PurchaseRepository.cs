using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Purchases;
using Cart360.Domain.Entities.Purchasing;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class PurchaseRepository : IPurchaseRepository
{
    private readonly Cart360DbContext _db;

    public PurchaseRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<PurchaseDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Purchases.Include(p => p.Supplier).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(p =>
                EF.Functions.ILike(p.PurchaseNumber, $"%{search}%") ||
                EF.Functions.ILike(p.Supplier.Name, $"%{search}%"));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "grandtotal" => request.SortDescending ? query.OrderByDescending(p => p.GrandTotal) : query.OrderBy(p => p.GrandTotal),
            _ => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(ProjectToDto()).ToListAsync(cancellationToken);
        return PagedResult<PurchaseDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public Task<PurchaseDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Purchases.Where(p => p.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken);

    public Task<Purchase?> GetEntityWithItemsByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Purchases.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<string> GenerateNextPurchaseNumberAsync(string prefix, CancellationToken cancellationToken = default)
    {
        var count = await _db.Purchases.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"{prefix}{count + 1:D5}";
    }

    public async Task AddAsync(Purchase purchase, CancellationToken cancellationToken = default) =>
        await _db.Purchases.AddAsync(purchase, cancellationToken);

    private static System.Linq.Expressions.Expression<Func<Purchase, PurchaseDto>> ProjectToDto() => p => new PurchaseDto(
        p.Id, p.PurchaseNumber, p.PurchaseDate, p.SupplierId, p.Supplier.Name, p.ReferenceBillNumber,
        p.Subtotal, p.DiscountAmount, p.CgstAmount, p.SgstAmount, p.RoundOff, p.GrandTotal, p.PaidAmount, p.BalanceAmount,
        p.Status, p.Notes,
        p.Items.Select(pi => new PurchaseItemDto(
            pi.Id, pi.ProductId, pi.Product.Name, pi.Quantity, pi.UnitPrice, pi.DiscountPercent,
            pi.GstPercent, pi.CgstAmount, pi.SgstAmount, pi.TotalAmount)).ToList(),
        p.CreatedAt);
}

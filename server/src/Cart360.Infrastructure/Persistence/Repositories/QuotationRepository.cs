using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Quotations;
using Cart360.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class QuotationRepository : IQuotationRepository
{
    private readonly Cart360DbContext _db;

    public QuotationRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<QuotationDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Quotations.Include(q => q.Customer).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(q =>
                EF.Functions.ILike(q.QuotationNumber, $"%{search}%") ||
                EF.Functions.ILike(q.Customer.Name, $"%{search}%"));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "grandtotal" => request.SortDescending ? query.OrderByDescending(q => q.GrandTotal) : query.OrderBy(q => q.GrandTotal),
            _ => request.SortDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(ProjectToDto()).ToListAsync(cancellationToken);
        return PagedResult<QuotationDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public Task<QuotationDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Quotations.Where(q => q.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken);

    public Task<Quotation?> GetEntityWithItemsByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Quotations.Include(q => q.Items).FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

    public async Task<string> GenerateNextQuotationNumberAsync(string prefix, CancellationToken cancellationToken = default)
    {
        var count = await _db.Quotations.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"{prefix}{count + 1:D5}";
    }

    public async Task AddAsync(Quotation quotation, CancellationToken cancellationToken = default) =>
        await _db.Quotations.AddAsync(quotation, cancellationToken);

    private static System.Linq.Expressions.Expression<Func<Quotation, QuotationDto>> ProjectToDto() => q => new QuotationDto(
        q.Id, q.QuotationNumber, q.QuotationDate, q.ExpiryDate, q.CustomerId, q.Customer.Name,
        q.Subtotal, q.DiscountAmount, q.CgstAmount, q.SgstAmount, q.RoundOff, q.GrandTotal,
        q.Status, q.ConvertedInvoiceId, q.Notes, q.Terms,
        q.Items.Select(i => new QuotationItemDto(
            i.Id, i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.DiscountPercent,
            i.GstPercent, i.CgstAmount, i.SgstAmount, i.TotalAmount)).ToList(),
        q.CreatedAt);
}

using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.Invoices;
using Cart360.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly Cart360DbContext _db;

    public InvoiceRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<InvoiceDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Invoices.Include(i => i.Customer).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(i =>
                EF.Functions.ILike(i.InvoiceNumber, $"%{search}%") ||
                EF.Functions.ILike(i.Customer.Name, $"%{search}%"));
        }

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "grandtotal" => request.SortDescending ? query.OrderByDescending(i => i.GrandTotal) : query.OrderBy(i => i.GrandTotal),
            "invoicedate" => request.SortDescending ? query.OrderByDescending(i => i.InvoiceDate) : query.OrderBy(i => i.InvoiceDate),
            _ => request.SortDescending ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(ProjectToDto())
            .ToListAsync(cancellationToken);

        return PagedResult<InvoiceDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public Task<InvoiceDto?> GetDtoByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Invoices.Where(i => i.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken);

    public Task<Invoice?> GetEntityWithItemsByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

    public async Task<string> GenerateNextInvoiceNumberAsync(string prefix, CancellationToken cancellationToken = default)
    {
        var count = await _db.Invoices.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"{prefix}{count + 1:D5}";
    }

    public async Task AddAsync(Invoice invoice, CancellationToken cancellationToken = default) =>
        await _db.Invoices.AddAsync(invoice, cancellationToken);

    private static System.Linq.Expressions.Expression<Func<Invoice, InvoiceDto>> ProjectToDto() => i => new InvoiceDto(
        i.Id,
        i.InvoiceNumber,
        i.InvoiceDate,
        i.DueDate,
        i.CustomerId,
        i.Customer.Name,
        i.Subtotal,
        i.DiscountAmount,
        i.CgstAmount,
        i.SgstAmount,
        i.IgstAmount,
        i.RoundOff,
        i.GrandTotal,
        i.PaidAmount,
        i.BalanceAmount,
        i.PaymentMethod,
        i.Status,
        i.Notes,
        i.Terms,
        i.PrintCount,
        i.Items.Select(ii => new InvoiceItemDto(
            ii.Id, ii.ProductId, ii.Product.Name, ii.Description, ii.Quantity, ii.UnitPrice,
            ii.DiscountPercent, ii.DiscountAmount, ii.GstPercent, ii.CgstAmount, ii.SgstAmount, ii.IgstAmount, ii.TotalAmount
        )).ToList(),
        i.CreatedAt);
}

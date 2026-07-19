using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Application.Features.StockAdjustments;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class StockAdjustmentService : IStockAdjustmentService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public StockAdjustmentService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<PagedResult<StockAdjustmentDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.StockAdjustments.OrderByDescending(a => a.CreatedAt).AsQueryable();
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).Select(ProjectToDto()).ToListAsync(cancellationToken);
        return PagedResult<StockAdjustmentDto>.Create(items, request.Page, request.PageSize, totalCount);
    }

    public async Task<StockAdjustmentDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.StockAdjustments.Where(a => a.Id == id).Select(ProjectToDto()).FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("StockAdjustment", id);

    public async Task<StockAdjustmentDto> CreateAsync(CreateStockAdjustmentRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var adjustment = new Domain.Entities.Inventory.StockAdjustment
        {
            TenantId = tenantId,
            AdjustmentNumber = await GenerateNextAdjustmentNumberAsync(cancellationToken),
            AdjustmentDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Reason = request.Reason,
            Notes = request.Notes,
            Status = StockAdjustmentStatus.Completed
        };

        foreach (var itemRequest in request.Items)
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId, cancellationToken)
                ?? throw new NotFoundException("Product", itemRequest.ProductId);

            var systemQuantity = product.CurrentStock;
            var difference = itemRequest.ActualQuantity - systemQuantity;

            adjustment.Items.Add(new StockAdjustmentItem
            {
                ProductId = product.Id,
                SystemQuantity = systemQuantity,
                ActualQuantity = itemRequest.ActualQuantity
            });

            if (difference != 0)
            {
                product.CurrentStock = itemRequest.ActualQuantity;
                _db.StockLedgerEntries.Add(new StockLedgerEntry
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    WarehouseId = product.WarehouseId,
                    TransactionType = StockTransactionType.Adjustment,
                    ReferenceType = "StockAdjustment",
                    ReferenceId = adjustment.Id,
                    QuantityIn = difference > 0 ? difference : 0,
                    QuantityOut = difference < 0 ? -difference : 0,
                    BalanceAfter = product.CurrentStock,
                    Notes = request.Reason
                });
            }
        }

        _db.StockAdjustments.Add(adjustment);
        await _db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(adjustment.Id, cancellationToken);
    }

    private async Task<string> GenerateNextAdjustmentNumberAsync(CancellationToken cancellationToken)
    {
        var count = await _db.StockAdjustments.IgnoreQueryFilters().CountAsync(cancellationToken);
        return $"ADJ-{count + 1:D5}";
    }

    private static System.Linq.Expressions.Expression<Func<Domain.Entities.Inventory.StockAdjustment, StockAdjustmentDto>> ProjectToDto() => a => new StockAdjustmentDto(
        a.Id, a.AdjustmentNumber, a.AdjustmentDate, a.Reason, a.Notes,
        a.Items.Select(i => new StockAdjustmentItemDto(i.Id, i.ProductId, i.Product.Name, i.SystemQuantity, i.ActualQuantity, i.ActualQuantity - i.SystemQuantity)).ToList(),
        a.CreatedAt);
}

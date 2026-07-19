using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Inventory;

/// <summary>
/// Append-only stock movement record — the authoritative audit trail behind
/// <see cref="Product.CurrentStock"/>. Never updated or deleted; corrections
/// are made by inserting an offsetting <see cref="StockTransactionType.Adjustment"/> entry.
/// </summary>
public class StockLedgerEntry : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public Guid? BatchId { get; set; }
    public ProductBatch? Batch { get; set; }

    public StockTransactionType TransactionType { get; set; }

    /// <summary>e.g. "Invoice", "Purchase", "SalesReturn", "PurchaseReturn", "StockAdjustment".</summary>
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }

    public decimal QuantityIn { get; set; }
    public decimal QuantityOut { get; set; }
    public decimal BalanceAfter { get; set; }
    public decimal? UnitCost { get; set; }
    public string? Notes { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }
}

using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Inventory;

public class StockAdjustment : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public string AdjustmentNumber { get; set; } = default!;
    public DateOnly AdjustmentDate { get; set; }

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public StockAdjustmentStatus Status { get; set; } = StockAdjustmentStatus.Completed;

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }

    public ICollection<StockAdjustmentItem> Items { get; set; } = new List<StockAdjustmentItem>();
}

public class StockAdjustmentItem : BaseEntity
{
    public Guid StockAdjustmentId { get; set; }
    public StockAdjustment StockAdjustment { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid? BatchId { get; set; }
    public ProductBatch? Batch { get; set; }

    public decimal SystemQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public decimal DifferenceQuantity => ActualQuantity - SystemQuantity;
}

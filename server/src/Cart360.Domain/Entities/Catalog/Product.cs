using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Catalog;

public class Product : TenantAuditableEntity
{
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }

    public Guid UnitId { get; set; }
    public Unit Unit { get; set; } = default!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public string Name { get; set; } = default!;
    public string Sku { get; set; } = default!;
    public string? Barcode { get; set; }
    public string? HsnCode { get; set; }

    public decimal GstPercent { get; set; }
    public decimal CgstPercent { get; set; }
    public decimal SgstPercent { get; set; }
    public decimal IgstPercent { get; set; }

    public decimal PurchasePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal Mrp { get; set; }

    public decimal OpeningStock { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal? MaxStockLevel { get; set; }

    public bool TrackInventory { get; set; } = true;
    public bool TrackBatches { get; set; }

    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ProductBatch> Batches { get; set; } = new List<ProductBatch>();

    public bool IsLowStock => TrackInventory && CurrentStock <= MinStockLevel;
}

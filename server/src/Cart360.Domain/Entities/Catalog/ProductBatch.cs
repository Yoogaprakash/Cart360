using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Catalog;

/// <summary>A tracked batch/lot of a product with its own expiry date, for products where <see cref="Product.TrackBatches"/> is true.</summary>
public class ProductBatch : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public string BatchNumber { get; set; } = default!;
    public DateOnly? ExpiryDate { get; set; }
    public decimal Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public bool IsExpired => ExpiryDate is not null && ExpiryDate < DateOnly.FromDateTime(DateTime.UtcNow);
}

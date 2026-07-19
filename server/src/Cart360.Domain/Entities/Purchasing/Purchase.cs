using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Purchasing;

public class Purchase : TenantAuditableEntity
{
    public string PurchaseNumber { get; set; } = default!;
    public DateOnly PurchaseDate { get; set; }

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = default!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public string? ReferenceBillNumber { get; set; }

    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal RoundOff { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }

    public PurchaseStatus Status { get; set; } = PurchaseStatus.Draft;
    public string? Notes { get; set; }

    public ICollection<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();
}

public class PurchaseItem : BaseEntity
{
    public Guid PurchaseId { get; set; }
    public Purchase Purchase { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal GstPercent { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public string? BatchNumber { get; set; }
    public DateOnly? ExpiryDate { get; set; }
}

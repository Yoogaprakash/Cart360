using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Purchasing;

public class PurchaseReturn : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public string ReturnNumber { get; set; } = default!;
    public DateOnly ReturnDate { get; set; }

    public Guid PurchaseId { get; set; }
    public Purchase Purchase { get; set; } = default!;

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = default!;

    public decimal Subtotal { get; set; }
    public decimal GstAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string? Reason { get; set; }
    public ReturnStatus Status { get; set; } = ReturnStatus.Completed;

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }

    public ICollection<PurchaseReturnItem> Items { get; set; } = new List<PurchaseReturnItem>();
}

public class PurchaseReturnItem : BaseEntity
{
    public Guid PurchaseReturnId { get; set; }
    public PurchaseReturn PurchaseReturn { get; set; } = default!;

    public Guid PurchaseItemId { get; set; }
    public PurchaseItem PurchaseItem { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
}

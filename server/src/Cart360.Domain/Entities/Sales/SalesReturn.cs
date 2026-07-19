using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Sales;

public class SalesReturn : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }

    public string ReturnNumber { get; set; } = default!;
    public DateOnly ReturnDate { get; set; }

    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = default!;

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;

    public decimal Subtotal { get; set; }
    public decimal GstAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string? Reason { get; set; }
    public ReturnStatus Status { get; set; } = ReturnStatus.Completed;

    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }

    public ICollection<SalesReturnItem> Items { get; set; } = new List<SalesReturnItem>();
}

public class SalesReturnItem : BaseEntity
{
    public Guid SalesReturnId { get; set; }
    public SalesReturn SalesReturn { get; set; } = default!;

    public Guid InvoiceItemId { get; set; }
    public InvoiceItem InvoiceItem { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
}

using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Sales;

public class Invoice : TenantAuditableEntity
{
    public string InvoiceNumber { get; set; } = default!;
    public DateOnly InvoiceDate { get; set; }
    public DateOnly? DueDate { get; set; }

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;

    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public decimal Subtotal { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal RoundOff { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }

    public InvoicePaymentMethod PaymentMethod { get; set; } = InvoicePaymentMethod.Cash;
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public int PrintCount { get; set; }

    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}

public class InvoiceItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid? BatchId { get; set; }
    public ProductBatch? Batch { get; set; }

    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal GstPercent { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

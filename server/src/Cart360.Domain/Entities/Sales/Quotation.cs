using Cart360.Domain.Common;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Sales;

public class Quotation : TenantAuditableEntity
{
    public string QuotationNumber { get; set; } = default!;
    public DateOnly QuotationDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;

    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal RoundOff { get; set; }
    public decimal GrandTotal { get; set; }

    public QuotationStatus Status { get; set; } = QuotationStatus.Draft;

    /// <summary>Set once this quotation has been converted; conversion copies <see cref="Items"/> into a new Invoice's items.</summary>
    public Guid? ConvertedInvoiceId { get; set; }
    public Invoice? ConvertedInvoice { get; set; }

    public string? Notes { get; set; }
    public string? Terms { get; set; }

    public ICollection<QuotationItem> Items { get; set; } = new List<QuotationItem>();
}

public class QuotationItem : BaseEntity
{
    public Guid QuotationId { get; set; }
    public Quotation Quotation { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

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

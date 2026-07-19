using Cart360.Domain.Common;

namespace Cart360.Domain.Entities.Sales;

public class Customer : TenantAuditableEntity
{
    public string CustomerCode { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? GstNumber { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public decimal OutstandingAmount { get; set; }
    public decimal CreditLimit { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
}

using Cart360.Domain.Common;
using Cart360.Domain.Enums;

namespace Cart360.Domain.Entities.Settings;

/// <summary>
/// A saved print template configuration for a tenant. A tenant may have several
/// (e.g. one A4/Modern default for invoices, one Thermal80/Minimal for a POS counter);
/// exactly one per (TenantId, PaperSize, TemplateStyle) combination is marked <see cref="IsDefault"/>.
/// </summary>
public class PrinterSettings : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }

    public PaperSize PaperSize { get; set; } = PaperSize.A4;
    public Orientation Orientation { get; set; } = Orientation.Portrait;
    public TemplateStyle TemplateStyle { get; set; } = TemplateStyle.Modern;

    public bool ShowLogo { get; set; } = true;
    public bool ShowQr { get; set; } = true;
    public bool ShowBarcode { get; set; }
    public bool ShowSignature { get; set; } = true;
    public bool ShowTerms { get; set; } = true;
    public bool ShowGstBreakdown { get; set; } = true;

    public string? HeaderText { get; set; }
    public string? FooterText { get; set; }
    public bool IsDefault { get; set; } = true;
}

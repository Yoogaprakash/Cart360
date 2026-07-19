using Cart360.Domain.Entities.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class PrinterSettingsConfiguration : IEntityTypeConfiguration<PrinterSettings>
{
    public void Configure(EntityTypeBuilder<PrinterSettings> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PaperSize).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Orientation).IsRequired().HasConversion<string>().HasMaxLength(10);
        builder.Property(x => x.TemplateStyle).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => new { x.TenantId, x.PaperSize, x.TemplateStyle }).IsUnique();
    }
}

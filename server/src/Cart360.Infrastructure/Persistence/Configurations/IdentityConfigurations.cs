using Cart360.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cart360.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.LastName).HasMaxLength(100);
        builder.Property(x => x.Email).IsRequired();
        builder.Property(x => x.PasswordHash).IsRequired();
        builder.Property(x => x.Role).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Version).IsConcurrencyToken();

        // Email unique per tenant; globally unique for Super Admin (TenantId IS NULL).
        builder.HasIndex(x => new { x.TenantId, x.Email })
            .IsUnique()
            .HasFilter("tenant_id IS NOT NULL")
            .HasDatabaseName("ux_users_email_tenant");

        builder.HasIndex(x => x.Email)
            .IsUnique()
            .HasFilter("tenant_id IS NULL")
            .HasDatabaseName("ux_users_email_superadmin");

        builder.HasIndex(x => x.TenantId);
    }
}

public class UserPermissionConfiguration : IEntityTypeConfiguration<UserPermission>
{
    public void Configure(EntityTypeBuilder<UserPermission> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.User)
            .WithMany(u => u.Permissions)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Module).IsRequired().HasMaxLength(50);
        builder.HasIndex(x => new { x.UserId, x.Module }).IsUnique();
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.TokenHash).IsRequired().HasMaxLength(255);
        builder.HasIndex(x => x.TokenHash).IsUnique();
        builder.HasIndex(x => x.UserId);
        builder.Ignore(x => x.IsActive);
    }
}

public class OtpCodeConfiguration : IEntityTypeConfiguration<OtpCode>
{
    public void Configure(EntityTypeBuilder<OtpCode> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Email).IsRequired();
        builder.Property(x => x.CodeHash).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Purpose).IsRequired().HasConversion<string>().HasMaxLength(30);

        builder.HasIndex(x => new { x.Email, x.Purpose, x.IsUsed });
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne<Cart360.Domain.Entities.Platform.Tenant>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Message).IsRequired();
        builder.Property(x => x.Type).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => new { x.TenantId, x.UserId, x.IsRead, x.CreatedAt });
    }
}

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne<Cart360.Domain.Entities.Platform.Tenant>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(x => x.Module).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Action).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt });
    }
}

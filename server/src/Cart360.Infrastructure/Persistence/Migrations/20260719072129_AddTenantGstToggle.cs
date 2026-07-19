using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cart360.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantGstToggle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_gst_enabled",
                table: "tenants",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_gst_enabled",
                table: "tenants");
        }
    }
}

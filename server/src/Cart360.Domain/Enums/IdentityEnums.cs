namespace Cart360.Domain.Enums;

public enum UserRole
{
    SuperAdmin,
    CompanyAdmin,
    Employee,
    CompanyUser
}

public enum OtpPurpose
{
    EmailVerification,
    PasswordReset,
    Login2FA
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error
}

/// <summary>
/// Well-known module names used as the discriminator in <see cref="Cart360.Domain.Entities.Identity.UserPermission"/>.
/// Kept as string constants (not an enum) so new modules can be added without a schema/enum migration.
/// </summary>
public static class ModuleNames
{
    public const string Dashboard = "Dashboard";
    public const string Invoices = "Invoices";
    public const string Quotations = "Quotations";
    public const string Products = "Products";
    public const string Categories = "Categories";
    public const string Brands = "Brands";
    public const string Units = "Units";
    public const string Customers = "Customers";
    public const string Suppliers = "Suppliers";
    public const string Purchases = "Purchases";
    public const string PurchaseReturns = "PurchaseReturns";
    public const string SalesReturns = "SalesReturns";
    public const string Inventory = "Inventory";
    public const string StockAdjustments = "StockAdjustments";
    public const string Warehouses = "Warehouses";
    public const string Expenses = "Expenses";
    public const string Income = "Income";
    public const string Payments = "Payments";
    public const string Receipts = "Receipts";
    public const string Reports = "Reports";
    public const string Users = "Users";
    public const string CompanySettings = "CompanySettings";
}

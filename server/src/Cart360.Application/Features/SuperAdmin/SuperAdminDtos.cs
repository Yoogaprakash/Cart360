namespace Cart360.Application.Features.SuperAdmin;

public record SuperAdminDashboardDto(
    int TotalCompanies,
    int ActiveCompanies,
    int PendingCompanies,
    int SuspendedCompanies,
    int TotalUsers,
    decimal MonthlyRecurringRevenue,
    IReadOnlyCollection<MonthlyGrowthRow> MonthlyGrowth);

public record MonthlyGrowthRow(int Year, int Month, int NewCompanies);

public record SubscriptionPlanDto(
    Guid Id, string Name, string Code, string? Description, decimal MonthlyPrice, decimal YearlyPrice, string Currency,
    int MaxUsers, int MaxEmployees, int MaxProducts, int MaxCustomers, int MaxSuppliers,
    int MaxMonthlyInvoices, int MaxMonthlyQuotations, int MaxMonthlyPrints, int MaxStorageMb, int MaxWarehouses,
    bool CanExportPdf, bool CanExportExcel, bool CanPrint, bool CanAddLogo, bool CanAddGst, bool CanAddMultiBranch, bool CanUseApi,
    bool IsActive, int SortOrder);

public record UpsertSubscriptionPlanRequest(
    string Name, string Code, string? Description, decimal MonthlyPrice, decimal YearlyPrice, string Currency,
    int MaxUsers, int MaxEmployees, int MaxProducts, int MaxCustomers, int MaxSuppliers,
    int MaxMonthlyInvoices, int MaxMonthlyQuotations, int MaxMonthlyPrints, int MaxStorageMb, int MaxWarehouses,
    bool CanExportPdf, bool CanExportExcel, bool CanPrint, bool CanAddLogo, bool CanAddGst, bool CanAddMultiBranch, bool CanUseApi,
    bool IsActive, int SortOrder);

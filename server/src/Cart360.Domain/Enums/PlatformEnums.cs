namespace Cart360.Domain.Enums;

public enum TenantStatus
{
    Pending,
    Active,
    Suspended,
    Rejected
}

public enum BillingCycle
{
    Monthly,
    Yearly
}

public enum SubscriptionStatus
{
    Trial,
    Active,
    Expired,
    Cancelled
}

/// <summary>Every capacity-bound resource a <see cref="Cart360.Domain.Entities.Platform.SubscriptionPlan"/> caps.</summary>
public enum SubscriptionLimitType
{
    Users,
    Employees,
    Products,
    Customers,
    Suppliers,
    MonthlyInvoices,
    MonthlyQuotations,
    MonthlyPrints,
    StorageMb,
    Warehouses
}

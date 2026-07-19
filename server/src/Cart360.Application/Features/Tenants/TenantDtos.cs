using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Tenants;

public record CompanyListItemDto(
    Guid Id,
    string Name,
    string Slug,
    TenantStatus Status,
    string Email,
    string? PlanName,
    int UserCount,
    DateTimeOffset CreatedAt);

public record CompanyDetailDto(
    Guid Id,
    string Name,
    string Slug,
    TenantStatus Status,
    string? GstNumber,
    string? PanNumber,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string Country,
    string? Phone,
    string Email,
    string? LogoUrl,
    string? SignatureUrl,
    string? TermsAndConditions,
    string? BankName,
    string? BankAccountNumber,
    string? BankIfsc,
    string? BankBranch,
    string? UpiId,
    string? UpiQrUrl,
    bool IsGstEnabled,
    string InvoicePrefix,
    string QuotationPrefix,
    string PurchasePrefix,
    string ThemeColor,
    string Currency,
    string Language,
    string Timezone,
    string? PlanName,
    string? PlanCode,
    DateOnly? SubscriptionEndDate,
    DateTimeOffset CreatedAt);

public record SuspendCompanyRequest(string Reason);

public record RejectCompanyRequest(string Reason);

public record ChangeCompanyPlanRequest(Guid PlanId);

public record UpdateCompanySettingsRequest(
    string Name,
    string? GstNumber,
    string? PanNumber,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? Phone,
    string Email,
    string? LogoUrl,
    string? SignatureUrl,
    string? TermsAndConditions,
    string? BankName,
    string? BankAccountNumber,
    string? BankIfsc,
    string? BankBranch,
    string? UpiId,
    string? UpiQrUrl,
    bool IsGstEnabled,
    string InvoicePrefix,
    string QuotationPrefix,
    string PurchasePrefix,
    string ThemeColor,
    string Currency,
    string Language,
    string Timezone);

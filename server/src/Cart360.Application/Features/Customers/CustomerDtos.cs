namespace Cart360.Application.Features.Customers;

public record CustomerDto(
    Guid Id,
    string CustomerCode,
    string Name,
    string? GstNumber,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    decimal OutstandingAmount,
    decimal CreditLimit,
    string? Notes,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record CreateCustomerRequest(
    string Name,
    string? GstNumber,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    decimal CreditLimit,
    string? Notes);

public record UpdateCustomerRequest(
    string Name,
    string? GstNumber,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    decimal CreditLimit,
    string? Notes,
    bool IsActive);

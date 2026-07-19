namespace Cart360.Application.Features.Suppliers;

public record SupplierDto(
    Guid Id,
    string SupplierCode,
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
    string? Notes,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record CreateSupplierRequest(
    string Name,
    string? GstNumber,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Notes);

public record UpdateSupplierRequest(
    string Name,
    string? GstNumber,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? Notes,
    bool IsActive);

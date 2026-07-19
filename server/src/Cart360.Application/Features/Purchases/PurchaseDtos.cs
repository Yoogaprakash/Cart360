using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Purchases;

public record PurchaseItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal GstPercent,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal TotalAmount);

public record PurchaseDto(
    Guid Id,
    string PurchaseNumber,
    DateOnly PurchaseDate,
    Guid SupplierId,
    string SupplierName,
    string? ReferenceBillNumber,
    decimal Subtotal,
    decimal DiscountAmount,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal RoundOff,
    decimal GrandTotal,
    decimal PaidAmount,
    decimal BalanceAmount,
    PurchaseStatus Status,
    string? Notes,
    IReadOnlyCollection<PurchaseItemDto> Items,
    DateTimeOffset CreatedAt);

public record CreatePurchaseItemRequest(Guid ProductId, decimal Quantity, decimal UnitPrice, decimal DiscountPercent);

public record CreatePurchaseRequest(
    Guid SupplierId,
    DateOnly PurchaseDate,
    string? ReferenceBillNumber,
    decimal PaidAmount,
    string? Notes,
    IReadOnlyCollection<CreatePurchaseItemRequest> Items);

public record RecordPurchasePaymentRequest(decimal Amount);

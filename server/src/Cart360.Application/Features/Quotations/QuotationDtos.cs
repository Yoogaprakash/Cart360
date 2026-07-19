using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Quotations;

public record QuotationItemDto(
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

public record QuotationDto(
    Guid Id,
    string QuotationNumber,
    DateOnly QuotationDate,
    DateOnly? ExpiryDate,
    Guid CustomerId,
    string CustomerName,
    decimal Subtotal,
    decimal DiscountAmount,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal RoundOff,
    decimal GrandTotal,
    QuotationStatus Status,
    Guid? ConvertedInvoiceId,
    string? Notes,
    string? Terms,
    IReadOnlyCollection<QuotationItemDto> Items,
    DateTimeOffset CreatedAt);

public record CreateQuotationItemRequest(Guid ProductId, decimal Quantity, decimal? UnitPrice, decimal DiscountPercent);

public record CreateQuotationRequest(
    Guid CustomerId,
    DateOnly QuotationDate,
    DateOnly? ExpiryDate,
    string? Notes,
    string? Terms,
    IReadOnlyCollection<CreateQuotationItemRequest> Items);

public record UpdateQuotationStatusRequest(QuotationStatus Status);

using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Invoices;

public record InvoiceItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal GstPercent,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount,
    decimal TotalAmount);

public record InvoiceDto(
    Guid Id,
    string InvoiceNumber,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    Guid CustomerId,
    string CustomerName,
    decimal Subtotal,
    decimal DiscountAmount,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount,
    decimal RoundOff,
    decimal GrandTotal,
    decimal PaidAmount,
    decimal BalanceAmount,
    InvoicePaymentMethod PaymentMethod,
    InvoiceStatus Status,
    string? Notes,
    string? Terms,
    int PrintCount,
    IReadOnlyCollection<InvoiceItemDto> Items,
    DateTimeOffset CreatedAt);

public record CreateInvoiceItemRequest(
    Guid ProductId,
    decimal Quantity,
    decimal? UnitPrice,
    decimal DiscountPercent);

public record CreateInvoiceRequest(
    Guid CustomerId,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    InvoicePaymentMethod PaymentMethod,
    decimal PaidAmount,
    string? Notes,
    string? Terms,
    IReadOnlyCollection<CreateInvoiceItemRequest> Items);

public record RecordInvoicePaymentRequest(decimal Amount);

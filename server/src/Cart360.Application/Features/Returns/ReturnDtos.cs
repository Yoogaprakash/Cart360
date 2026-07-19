using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Returns;

public record SalesReturnItemDto(Guid Id, Guid InvoiceItemId, Guid ProductId, string ProductName, decimal Quantity, decimal UnitPrice, decimal TotalAmount);

public record SalesReturnDto(
    Guid Id, string ReturnNumber, DateOnly ReturnDate, Guid InvoiceId, string InvoiceNumber,
    Guid CustomerId, string CustomerName, decimal Subtotal, decimal GstAmount, decimal GrandTotal,
    string? Reason, ReturnStatus Status, IReadOnlyCollection<SalesReturnItemDto> Items, DateTimeOffset CreatedAt);

public record CreateSalesReturnItemRequest(Guid InvoiceItemId, decimal Quantity);

public record CreateSalesReturnRequest(Guid InvoiceId, string? Reason, IReadOnlyCollection<CreateSalesReturnItemRequest> Items);

public record PurchaseReturnItemDto(Guid Id, Guid PurchaseItemId, Guid ProductId, string ProductName, decimal Quantity, decimal UnitPrice, decimal TotalAmount);

public record PurchaseReturnDto(
    Guid Id, string ReturnNumber, DateOnly ReturnDate, Guid PurchaseId, string PurchaseNumber,
    Guid SupplierId, string SupplierName, decimal Subtotal, decimal GstAmount, decimal GrandTotal,
    string? Reason, ReturnStatus Status, IReadOnlyCollection<PurchaseReturnItemDto> Items, DateTimeOffset CreatedAt);

public record CreatePurchaseReturnItemRequest(Guid PurchaseItemId, decimal Quantity);

public record CreatePurchaseReturnRequest(Guid PurchaseId, string? Reason, IReadOnlyCollection<CreatePurchaseReturnItemRequest> Items);

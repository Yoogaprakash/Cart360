namespace Cart360.Application.Features.StockAdjustments;

public record StockAdjustmentItemDto(Guid Id, Guid ProductId, string ProductName, decimal SystemQuantity, decimal ActualQuantity, decimal DifferenceQuantity);

public record StockAdjustmentDto(
    Guid Id, string AdjustmentNumber, DateOnly AdjustmentDate, string? Reason, string? Notes,
    IReadOnlyCollection<StockAdjustmentItemDto> Items, DateTimeOffset CreatedAt);

public record CreateStockAdjustmentItemRequest(Guid ProductId, decimal ActualQuantity);

public record CreateStockAdjustmentRequest(string? Reason, string? Notes, IReadOnlyCollection<CreateStockAdjustmentItemRequest> Items);

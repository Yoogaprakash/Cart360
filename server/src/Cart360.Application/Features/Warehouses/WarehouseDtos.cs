namespace Cart360.Application.Features.Warehouses;

public record WarehouseDto(Guid Id, string Name, string Code, string? Address, bool IsDefault, bool IsActive);

public record CreateWarehouseRequest(string Name, string Code, string? Address, bool IsDefault);

public record UpdateWarehouseRequest(string Name, string Code, string? Address, bool IsDefault, bool IsActive);

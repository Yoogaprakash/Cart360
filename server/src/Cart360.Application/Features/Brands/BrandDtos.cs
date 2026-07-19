namespace Cart360.Application.Features.Brands;

public record BrandDto(Guid Id, string Name, string? Description, bool IsActive);

public record CreateBrandRequest(string Name, string? Description);

public record UpdateBrandRequest(string Name, string? Description, bool IsActive);

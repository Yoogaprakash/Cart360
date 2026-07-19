namespace Cart360.Application.Features.Categories;

public record CategoryDto(Guid Id, Guid? ParentCategoryId, string? ParentCategoryName, string Name, string? Description, bool IsActive);

public record CreateCategoryRequest(Guid? ParentCategoryId, string Name, string? Description);

public record UpdateCategoryRequest(Guid? ParentCategoryId, string Name, string? Description, bool IsActive);

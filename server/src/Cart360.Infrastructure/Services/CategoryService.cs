using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Features.Categories;
using Cart360.Domain.Entities.Catalog;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly Cart360DbContext _db;
    private readonly ITenantContext _tenantContext;

    public CategoryService(Cart360DbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.ParentCategoryId, c.ParentCategory != null ? c.ParentCategory.Name : null, c.Name, c.Description, c.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var category = new Category { TenantId = tenantId, ParentCategoryId = request.ParentCategoryId, Name = request.Name, Description = request.Description, IsActive = true };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(category.Id, cancellationToken);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Category", id);

        category.ParentCategoryId = request.ParentCategoryId;
        category.Name = request.Name;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Category", id);

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        await _db.Categories.Where(c => c.Id == id)
            .Select(c => new CategoryDto(c.Id, c.ParentCategoryId, c.ParentCategory != null ? c.ParentCategory.Name : null, c.Name, c.Description, c.IsActive))
            .FirstAsync(cancellationToken);
}

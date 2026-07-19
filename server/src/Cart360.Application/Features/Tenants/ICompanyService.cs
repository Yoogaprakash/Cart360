using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Tenants;

public interface ICompanyService
{
    // Super Admin
    Task<PagedResult<CompanyListItemDto>> GetPagedCompaniesAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<CompanyDetailDto> GetCompanyDetailAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task ApproveCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task SuspendCompanyAsync(Guid tenantId, SuspendCompanyRequest request, CancellationToken cancellationToken = default);
    Task ReactivateCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task RejectCompanyAsync(Guid tenantId, RejectCompanyRequest request, CancellationToken cancellationToken = default);
    Task DeleteCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task ChangePlanAsync(Guid tenantId, ChangeCompanyPlanRequest request, CancellationToken cancellationToken = default);

    // Company Admin self-service
    Task<CompanyDetailDto> GetMyCompanyAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task UpdateMyCompanyAsync(Guid tenantId, UpdateCompanySettingsRequest request, CancellationToken cancellationToken = default);
}

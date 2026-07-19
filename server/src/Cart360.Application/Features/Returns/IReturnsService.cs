using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Returns;

public interface ISalesReturnService
{
    Task<PagedResult<SalesReturnDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<SalesReturnDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SalesReturnDto> CreateAsync(CreateSalesReturnRequest request, CancellationToken cancellationToken = default);
}

public interface IPurchaseReturnService
{
    Task<PagedResult<PurchaseReturnDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseReturnDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PurchaseReturnDto> CreateAsync(CreatePurchaseReturnRequest request, CancellationToken cancellationToken = default);
}

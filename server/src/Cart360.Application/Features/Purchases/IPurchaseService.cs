using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.Purchases;

public interface IPurchaseService
{
    Task<PagedResult<PurchaseDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PurchaseDto> CreateAsync(CreatePurchaseRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseDto> RecordPaymentAsync(Guid id, RecordPurchasePaymentRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseDto> CancelAsync(Guid id, CancellationToken cancellationToken = default);
}

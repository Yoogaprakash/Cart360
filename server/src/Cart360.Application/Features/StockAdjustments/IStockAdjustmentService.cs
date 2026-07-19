using Cart360.Application.Common.Models;

namespace Cart360.Application.Features.StockAdjustments;

public interface IStockAdjustmentService
{
    Task<PagedResult<StockAdjustmentDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default);
    Task<StockAdjustmentDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<StockAdjustmentDto> CreateAsync(CreateStockAdjustmentRequest request, CancellationToken cancellationToken = default);
}

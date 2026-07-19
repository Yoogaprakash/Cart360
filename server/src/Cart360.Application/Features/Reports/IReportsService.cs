namespace Cart360.Application.Features.Reports;

public interface IReportsService
{
    Task<SalesReportDto> GetSalesReportAsync(DateRangeRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseReportDto> GetPurchaseReportAsync(DateRangeRequest request, CancellationToken cancellationToken = default);
    Task<GstReportDto> GetGstReportAsync(DateRangeRequest request, CancellationToken cancellationToken = default);
    Task<ProfitLossDto> GetProfitLossAsync(DateRangeRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TopProductRow>> GetTopProductsAsync(DateRangeRequest request, int take = 10, CancellationToken cancellationToken = default);
    Task<InventoryReportDto> GetInventoryReportAsync(CancellationToken cancellationToken = default);
    Task<OutstandingReportDto> GetOutstandingReportAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MonthlySalesRow>> GetMonthlySalesAsync(int year, CancellationToken cancellationToken = default);
}

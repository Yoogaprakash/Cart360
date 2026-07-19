using Cart360.API.Filters;
using Cart360.Application.Features.Reports;
using Cart360.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "CompanyAdmin")]
[RequirePermission(ModuleNames.Reports, PermissionAction.View)]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _reportsService;

    public ReportsController(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    [HttpGet("sales")]
    public async Task<ActionResult<SalesReportDto>> GetSales([FromQuery] DateRangeRequest request, CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetSalesReportAsync(request, cancellationToken));

    [HttpGet("purchases")]
    public async Task<ActionResult<PurchaseReportDto>> GetPurchases([FromQuery] DateRangeRequest request, CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetPurchaseReportAsync(request, cancellationToken));

    [HttpGet("gst")]
    public async Task<ActionResult<GstReportDto>> GetGst([FromQuery] DateRangeRequest request, CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetGstReportAsync(request, cancellationToken));

    [HttpGet("profit-loss")]
    public async Task<ActionResult<ProfitLossDto>> GetProfitLoss([FromQuery] DateRangeRequest request, CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetProfitLossAsync(request, cancellationToken));

    [HttpGet("top-products")]
    public async Task<ActionResult<IReadOnlyList<TopProductRow>>> GetTopProducts([FromQuery] DateRangeRequest request, [FromQuery] int take = 10, CancellationToken cancellationToken = default) =>
        Ok(await _reportsService.GetTopProductsAsync(request, take, cancellationToken));

    [HttpGet("inventory")]
    public async Task<ActionResult<InventoryReportDto>> GetInventory(CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetInventoryReportAsync(cancellationToken));

    [HttpGet("outstanding")]
    public async Task<ActionResult<OutstandingReportDto>> GetOutstanding(CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetOutstandingReportAsync(cancellationToken));

    [HttpGet("monthly-sales")]
    public async Task<ActionResult<IReadOnlyList<MonthlySalesRow>>> GetMonthlySales([FromQuery] int year, CancellationToken cancellationToken) =>
        Ok(await _reportsService.GetMonthlySalesAsync(year, cancellationToken));
}

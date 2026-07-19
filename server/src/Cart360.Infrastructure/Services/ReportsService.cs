using Cart360.Application.Features.Reports;
using Cart360.Domain.Enums;
using Cart360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Services;

public class ReportsService : IReportsService
{
    private readonly Cart360DbContext _db;

    public ReportsService(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task<SalesReportDto> GetSalesReportAsync(DateRangeRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Invoices.Where(i => i.Status != InvoiceStatus.Cancelled).AsQueryable();
        if (request.From.HasValue) query = query.Where(i => i.InvoiceDate >= request.From.Value);
        if (request.To.HasValue) query = query.Where(i => i.InvoiceDate <= request.To.Value);

        // EF Core can't translate a record constructor with aggregate calls inside a
        // GroupBy().Select() — project into an anonymous type first (translatable to SQL)
        // and materialize the record afterward, in memory.
        var grouped = await query
            .GroupBy(i => i.InvoiceDate)
            .Select(g => new { Date = g.Key, Count = g.Count(), Subtotal = g.Sum(i => i.Subtotal), Gst = g.Sum(i => i.CgstAmount + i.SgstAmount), Total = g.Sum(i => i.GrandTotal) })
            .OrderBy(g => g.Date)
            .ToListAsync(cancellationToken);

        var rows = grouped.Select(g => new SalesReportRow(g.Date, g.Count, g.Subtotal, g.Gst, g.Total)).ToList();

        return new SalesReportDto(rows, rows.Sum(r => r.GrandTotal), rows.Sum(r => r.InvoiceCount));
    }

    public async Task<PurchaseReportDto> GetPurchaseReportAsync(DateRangeRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Purchases.Where(p => p.Status != PurchaseStatus.Cancelled).AsQueryable();
        if (request.From.HasValue) query = query.Where(p => p.PurchaseDate >= request.From.Value);
        if (request.To.HasValue) query = query.Where(p => p.PurchaseDate <= request.To.Value);

        var grouped = await query
            .GroupBy(p => p.PurchaseDate)
            .Select(g => new { Date = g.Key, Count = g.Count(), Subtotal = g.Sum(p => p.Subtotal), Gst = g.Sum(p => p.CgstAmount + p.SgstAmount), Total = g.Sum(p => p.GrandTotal) })
            .OrderBy(g => g.Date)
            .ToListAsync(cancellationToken);

        var rows = grouped.Select(g => new PurchaseReportRow(g.Date, g.Count, g.Subtotal, g.Gst, g.Total)).ToList();

        return new PurchaseReportDto(rows, rows.Sum(r => r.GrandTotal), rows.Sum(r => r.PurchaseCount));
    }

    public async Task<GstReportDto> GetGstReportAsync(DateRangeRequest request, CancellationToken cancellationToken = default)
    {
        var invoiceQuery = _db.Invoices.Where(i => i.Status != InvoiceStatus.Cancelled).AsQueryable();
        var purchaseQuery = _db.Purchases.Where(p => p.Status != PurchaseStatus.Cancelled).AsQueryable();
        if (request.From.HasValue)
        {
            invoiceQuery = invoiceQuery.Where(i => i.InvoiceDate >= request.From.Value);
            purchaseQuery = purchaseQuery.Where(p => p.PurchaseDate >= request.From.Value);
        }
        if (request.To.HasValue)
        {
            invoiceQuery = invoiceQuery.Where(i => i.InvoiceDate <= request.To.Value);
            purchaseQuery = purchaseQuery.Where(p => p.PurchaseDate <= request.To.Value);
        }

        var outputCgst = await invoiceQuery.SumAsync(i => i.CgstAmount, cancellationToken);
        var outputSgst = await invoiceQuery.SumAsync(i => i.SgstAmount, cancellationToken);
        var inputCgst = await purchaseQuery.SumAsync(p => p.CgstAmount, cancellationToken);
        var inputSgst = await purchaseQuery.SumAsync(p => p.SgstAmount, cancellationToken);

        return new GstReportDto(outputCgst, outputSgst, inputCgst, inputSgst, (outputCgst + outputSgst) - (inputCgst + inputSgst));
    }

    public async Task<ProfitLossDto> GetProfitLossAsync(DateRangeRequest request, CancellationToken cancellationToken = default)
    {
        var invoiceQuery = _db.Invoices.Where(i => i.Status != InvoiceStatus.Cancelled).AsQueryable();
        var purchaseQuery = _db.Purchases.Where(p => p.Status != PurchaseStatus.Cancelled).AsQueryable();
        var expenseQuery = _db.Expenses.AsQueryable();
        var incomeQuery = _db.Incomes.AsQueryable();

        if (request.From.HasValue)
        {
            invoiceQuery = invoiceQuery.Where(i => i.InvoiceDate >= request.From.Value);
            purchaseQuery = purchaseQuery.Where(p => p.PurchaseDate >= request.From.Value);
            expenseQuery = expenseQuery.Where(e => e.ExpenseDate >= request.From.Value);
            incomeQuery = incomeQuery.Where(i => i.IncomeDate >= request.From.Value);
        }
        if (request.To.HasValue)
        {
            invoiceQuery = invoiceQuery.Where(i => i.InvoiceDate <= request.To.Value);
            purchaseQuery = purchaseQuery.Where(p => p.PurchaseDate <= request.To.Value);
            expenseQuery = expenseQuery.Where(e => e.ExpenseDate <= request.To.Value);
            incomeQuery = incomeQuery.Where(i => i.IncomeDate <= request.To.Value);
        }

        var salesRevenue = await invoiceQuery.SumAsync(i => i.Subtotal - i.DiscountAmount, cancellationToken);
        // Approximation: cost of goods sold is taken as total purchase value for the period
        // rather than matched to the specific units sold (that needs a FIFO/weighted-average
        // costing layer not yet built) — good enough for a directional P&L, not for audit.
        var costOfGoodsSold = await purchaseQuery.SumAsync(p => p.Subtotal - p.DiscountAmount, cancellationToken);
        var expenses = await expenseQuery.SumAsync(e => e.Amount, cancellationToken);
        var otherIncome = await incomeQuery.SumAsync(i => i.Amount, cancellationToken);

        var grossProfit = salesRevenue - costOfGoodsSold;
        var netProfit = grossProfit + otherIncome - expenses;

        return new ProfitLossDto(salesRevenue, otherIncome, costOfGoodsSold, expenses, grossProfit, netProfit);
    }

    public async Task<IReadOnlyList<TopProductRow>> GetTopProductsAsync(DateRangeRequest request, int take = 10, CancellationToken cancellationToken = default)
    {
        var query = _db.InvoiceItems.Where(ii => ii.Invoice.Status != InvoiceStatus.Cancelled).AsQueryable();
        if (request.From.HasValue) query = query.Where(ii => ii.Invoice.InvoiceDate >= request.From.Value);
        if (request.To.HasValue) query = query.Where(ii => ii.Invoice.InvoiceDate <= request.To.Value);

        var grouped = await query
            .GroupBy(ii => new { ii.ProductId, ii.Product.Name })
            .Select(g => new { g.Key.ProductId, g.Key.Name, Quantity = g.Sum(ii => ii.Quantity), Revenue = g.Sum(ii => ii.TotalAmount) })
            .OrderByDescending(g => g.Revenue)
            .Take(take)
            .ToListAsync(cancellationToken);

        return grouped.Select(g => new TopProductRow(g.ProductId, g.Name, g.Quantity, g.Revenue)).ToList();
    }

    public async Task<InventoryReportDto> GetInventoryReportAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.Products
            .Select(p => new InventoryReportRow(p.Id, p.Name, p.Sku, p.CurrentStock, p.MinStockLevel, p.CurrentStock * p.PurchasePrice, p.TrackInventory && p.CurrentStock <= p.MinStockLevel))
            .ToListAsync(cancellationToken);

        return new InventoryReportDto(rows, rows.Sum(r => r.StockValue), rows.Count(r => r.IsLowStock));
    }

    public async Task<OutstandingReportDto> GetOutstandingReportAsync(CancellationToken cancellationToken = default)
    {
        // Order by the raw entity column, then project — ordering by a property of an
        // already-projected record constructor is not translatable (EF Core re-inlines
        // the constructor into the ORDER BY and fails).
        var customers = await _db.Customers
            .Where(c => c.OutstandingAmount != 0)
            .OrderByDescending(c => c.OutstandingAmount)
            .Select(c => new OutstandingRow(c.Id, c.Name, c.OutstandingAmount))
            .ToListAsync(cancellationToken);

        var suppliers = await _db.Suppliers
            .Where(s => s.OutstandingAmount != 0)
            .OrderByDescending(s => s.OutstandingAmount)
            .Select(s => new OutstandingRow(s.Id, s.Name, s.OutstandingAmount))
            .ToListAsync(cancellationToken);

        return new OutstandingReportDto(customers, suppliers);
    }

    public async Task<IReadOnlyList<MonthlySalesRow>> GetMonthlySalesAsync(int year, CancellationToken cancellationToken = default)
    {
        var yearStart = new DateOnly(year, 1, 1);
        var yearEnd = new DateOnly(year, 12, 31);

        var grouped = await _db.Invoices
            .Where(i => i.Status != InvoiceStatus.Cancelled && i.InvoiceDate >= yearStart && i.InvoiceDate <= yearEnd)
            .GroupBy(i => i.InvoiceDate.Month)
            .Select(g => new { Month = g.Key, Total = g.Sum(i => i.GrandTotal) })
            .OrderBy(g => g.Month)
            .ToListAsync(cancellationToken);

        return grouped.Select(g => new MonthlySalesRow(year, g.Month, g.Total)).ToList();
    }
}

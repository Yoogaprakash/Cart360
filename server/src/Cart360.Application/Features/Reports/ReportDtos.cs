namespace Cart360.Application.Features.Reports;

public record DateRangeRequest(DateOnly? From, DateOnly? To);

public record SalesReportRow(DateOnly Date, int InvoiceCount, decimal Subtotal, decimal GstAmount, decimal GrandTotal);
public record SalesReportDto(IReadOnlyCollection<SalesReportRow> Rows, decimal TotalSales, int TotalInvoices);

public record PurchaseReportRow(DateOnly Date, int PurchaseCount, decimal Subtotal, decimal GstAmount, decimal GrandTotal);
public record PurchaseReportDto(IReadOnlyCollection<PurchaseReportRow> Rows, decimal TotalPurchases, int TotalPurchaseCount);

public record GstReportDto(decimal OutputCgst, decimal OutputSgst, decimal InputCgst, decimal InputSgst, decimal NetGstPayable);

public record ProfitLossDto(decimal SalesRevenue, decimal OtherIncome, decimal CostOfGoodsSold, decimal Expenses, decimal GrossProfit, decimal NetProfit);

public record TopProductRow(Guid ProductId, string ProductName, decimal QuantitySold, decimal Revenue);

public record InventoryReportRow(Guid ProductId, string ProductName, string Sku, decimal CurrentStock, decimal MinStockLevel, decimal StockValue, bool IsLowStock);
public record InventoryReportDto(IReadOnlyCollection<InventoryReportRow> Rows, decimal TotalStockValue, int LowStockCount);

public record OutstandingRow(Guid PartyId, string PartyName, decimal OutstandingAmount);
public record OutstandingReportDto(IReadOnlyCollection<OutstandingRow> Customers, IReadOnlyCollection<OutstandingRow> Suppliers);

public record MonthlySalesRow(int Year, int Month, decimal TotalSales);

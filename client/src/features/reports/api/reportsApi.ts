import { apiClient } from "../../../lib/apiClient";
import type {
  DateRangeParams,
  GstReportDto,
  InventoryReportDto,
  MonthlySalesRow,
  OutstandingReportDto,
  ProfitLossDto,
  PurchaseReportDto,
  SalesReportDto,
  TopProductRow
} from "../types";

export const reportsApi = {
  sales: (params: DateRangeParams) => apiClient.get<SalesReportDto>("/reports/sales", { params }).then((r) => r.data),
  purchases: (params: DateRangeParams) => apiClient.get<PurchaseReportDto>("/reports/purchases", { params }).then((r) => r.data),
  gst: (params: DateRangeParams) => apiClient.get<GstReportDto>("/reports/gst", { params }).then((r) => r.data),
  profitLoss: (params: DateRangeParams) => apiClient.get<ProfitLossDto>("/reports/profit-loss", { params }).then((r) => r.data),
  topProducts: (params: DateRangeParams) => apiClient.get<TopProductRow[]>("/reports/top-products", { params }).then((r) => r.data),
  inventory: () => apiClient.get<InventoryReportDto>("/reports/inventory").then((r) => r.data),
  outstanding: () => apiClient.get<OutstandingReportDto>("/reports/outstanding").then((r) => r.data),
  monthlySales: () => apiClient.get<MonthlySalesRow[]>("/reports/monthly-sales").then((r) => r.data)
};

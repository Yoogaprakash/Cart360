import { useQuery } from "@tanstack/react-query";
import type { DateRangeParams } from "../types";
import { reportsApi } from "./reportsApi";

export function useSalesReportQuery(params: DateRangeParams) {
  return useQuery({ queryKey: ["reports", "sales", params], queryFn: () => reportsApi.sales(params) });
}

export function usePurchaseReportQuery(params: DateRangeParams) {
  return useQuery({ queryKey: ["reports", "purchases", params], queryFn: () => reportsApi.purchases(params) });
}

export function useGstReportQuery(params: DateRangeParams) {
  return useQuery({ queryKey: ["reports", "gst", params], queryFn: () => reportsApi.gst(params) });
}

export function useProfitLossReportQuery(params: DateRangeParams) {
  return useQuery({ queryKey: ["reports", "profit-loss", params], queryFn: () => reportsApi.profitLoss(params) });
}

export function useTopProductsReportQuery(params: DateRangeParams) {
  return useQuery({ queryKey: ["reports", "top-products", params], queryFn: () => reportsApi.topProducts(params) });
}

export function useInventoryReportQuery() {
  return useQuery({ queryKey: ["reports", "inventory"], queryFn: reportsApi.inventory });
}

export function useOutstandingReportQuery() {
  return useQuery({ queryKey: ["reports", "outstanding"], queryFn: reportsApi.outstanding });
}

export function useMonthlySalesReportQuery() {
  return useQuery({ queryKey: ["reports", "monthly-sales"], queryFn: reportsApi.monthlySales });
}

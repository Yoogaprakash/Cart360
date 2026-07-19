import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateStockAdjustmentRequest, StockAdjustment } from "../types";

export const stockAdjustmentsApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<StockAdjustment>>("/stock-adjustments", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<StockAdjustment>(`/stock-adjustments/${id}`).then((r) => r.data),
  create: (payload: CreateStockAdjustmentRequest) => apiClient.post<StockAdjustment>("/stock-adjustments", payload).then((r) => r.data)
};

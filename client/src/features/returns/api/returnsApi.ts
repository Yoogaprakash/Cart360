import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type {
  CreatePurchaseReturnRequest,
  CreateSalesReturnRequest,
  PurchaseReturn,
  SalesReturn
} from "../types";

export const salesReturnsApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<SalesReturn>>("/sales-returns", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<SalesReturn>(`/sales-returns/${id}`).then((r) => r.data),
  create: (payload: CreateSalesReturnRequest) => apiClient.post<SalesReturn>("/sales-returns", payload).then((r) => r.data)
};

export const purchaseReturnsApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<PurchaseReturn>>("/purchase-returns", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<PurchaseReturn>(`/purchase-returns/${id}`).then((r) => r.data),
  create: (payload: CreatePurchaseReturnRequest) => apiClient.post<PurchaseReturn>("/purchase-returns", payload).then((r) => r.data)
};

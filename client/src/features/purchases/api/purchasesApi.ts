import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreatePurchaseRequest, Purchase } from "../types";

export const purchasesApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Purchase>>("/purchases", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Purchase>(`/purchases/${id}`).then((r) => r.data),
  create: (payload: CreatePurchaseRequest) => apiClient.post<Purchase>("/purchases", payload).then((r) => r.data),
  recordPayment: (id: string, amount: number) => apiClient.post<Purchase>(`/purchases/${id}/payments`, { amount }).then((r) => r.data),
  cancel: (id: string) => apiClient.post<Purchase>(`/purchases/${id}/cancel`).then((r) => r.data)
};

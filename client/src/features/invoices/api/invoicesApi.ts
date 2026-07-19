import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateInvoiceRequest, Invoice } from "../types";

export const invoicesApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Invoice>>("/invoices", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
  create: (payload: CreateInvoiceRequest) => apiClient.post<Invoice>("/invoices", payload).then((r) => r.data),
  recordPayment: (id: string, amount: number) => apiClient.post<Invoice>(`/invoices/${id}/payments`, { amount }).then((r) => r.data),
  cancel: (id: string) => apiClient.post<Invoice>(`/invoices/${id}/cancel`).then((r) => r.data),
  registerPrint: (id: string) => apiClient.post<Invoice>(`/invoices/${id}/print`).then((r) => r.data)
};

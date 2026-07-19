import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateQuotationRequest, Quotation, QuotationStatus } from "../types";
import type { Invoice } from "../../invoices/types";

export const quotationsApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Quotation>>("/quotations", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Quotation>(`/quotations/${id}`).then((r) => r.data),
  create: (payload: CreateQuotationRequest) => apiClient.post<Quotation>("/quotations", payload).then((r) => r.data),
  updateStatus: (id: string, status: QuotationStatus) => apiClient.put<Quotation>(`/quotations/${id}/status`, { status }).then((r) => r.data),
  convertToInvoice: (id: string) => apiClient.post<Invoice>(`/quotations/${id}/convert-to-invoice`).then((r) => r.data)
};

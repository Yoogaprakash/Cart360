import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateSupplierRequest, Supplier, UpdateSupplierRequest } from "../types";

export const suppliersApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Supplier>>("/suppliers", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),
  create: (payload: CreateSupplierRequest) => apiClient.post<Supplier>("/suppliers", payload).then((r) => r.data),
  update: (id: string, payload: UpdateSupplierRequest) => apiClient.put<Supplier>(`/suppliers/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/suppliers/${id}`)
};

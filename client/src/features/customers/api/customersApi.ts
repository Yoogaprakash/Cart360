import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "../types";

export const customersApi = {
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Customer>>("/customers", { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (payload: CreateCustomerRequest) => apiClient.post<Customer>("/customers", payload).then((r) => r.data),
  update: (id: string, payload: UpdateCustomerRequest) => apiClient.put<Customer>(`/customers/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/customers/${id}`)
};

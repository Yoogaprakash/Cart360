import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateProductRequest, Product, UpdateProductRequest } from "../types";

export const productsApi = {
  getPaged: (params: PagedRequest) =>
    apiClient.get<PagedResult<Product>>("/products", { params }).then((r) => r.data),

  getById: (id: string) => apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (payload: CreateProductRequest) => apiClient.post<Product>("/products", payload).then((r) => r.data),

  update: (id: string, payload: UpdateProductRequest) =>
    apiClient.put<Product>(`/products/${id}`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/products/${id}`)
};

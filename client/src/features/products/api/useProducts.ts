import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateProductRequest, UpdateProductRequest } from "../types";
import { productsApi } from "./productsApi";

const PRODUCTS_KEY = "products";

export function useProductsQuery(params: PagedRequest) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => productsApi.getPaged(params),
    placeholderData: (previous) => previous
  });
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductRequest) => productsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductRequest) => productsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
  });
}

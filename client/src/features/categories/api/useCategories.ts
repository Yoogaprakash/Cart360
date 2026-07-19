import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types";

const CATEGORIES_KEY = "categories";

const categoriesApi = {
  getAll: () => apiClient.get<Category[]>("/categories").then((r) => r.data),
  create: (payload: CreateCategoryRequest) => apiClient.post<Category>("/categories", payload).then((r) => r.data),
  update: (id: string, payload: UpdateCategoryRequest) => apiClient.put<Category>(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/categories/${id}`)
};

export function useCategoriesQuery() {
  return useQuery({ queryKey: [CATEGORIES_KEY], queryFn: categoriesApi.getAll });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: categoriesApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }) });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: categoriesApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }) });
}

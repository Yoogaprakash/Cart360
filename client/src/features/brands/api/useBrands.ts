import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

const BRANDS_KEY = "brands";

const brandsApi = {
  getAll: () => apiClient.get<Brand[]>("/brands").then((r) => r.data),
  create: (payload: { name: string; description?: string | null }) => apiClient.post<Brand>("/brands", payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/brands/${id}`)
};

export function useBrandsQuery() {
  return useQuery({ queryKey: [BRANDS_KEY], queryFn: brandsApi.getAll });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: brandsApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] }) });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: brandsApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] }) });
}

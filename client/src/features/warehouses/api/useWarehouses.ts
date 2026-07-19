import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateWarehouseRequest {
  name: string;
  code: string;
  address?: string | null;
  isDefault: boolean;
}

const WAREHOUSES_KEY = "warehouses";

const warehousesApi = {
  getAll: () => apiClient.get<Warehouse[]>("/warehouses").then((r) => r.data),
  create: (payload: CreateWarehouseRequest) => apiClient.post<Warehouse>("/warehouses", payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/warehouses/${id}`)
};

export function useWarehousesQuery() {
  return useQuery({ queryKey: [WAREHOUSES_KEY], queryFn: warehousesApi.getAll });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: warehousesApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: [WAREHOUSES_KEY] }) });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: warehousesApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: [WAREHOUSES_KEY] }) });
}

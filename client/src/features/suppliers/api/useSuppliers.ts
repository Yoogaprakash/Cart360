import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateSupplierRequest, UpdateSupplierRequest } from "../types";
import { suppliersApi } from "./suppliersApi";

const SUPPLIERS_KEY = "suppliers";

export function useSuppliersQuery(params: PagedRequest) {
  return useQuery({ queryKey: [SUPPLIERS_KEY, params], queryFn: () => suppliersApi.getPaged(params), placeholderData: (p) => p });
}

export function useSupplierQuery(id: string | undefined) {
  return useQuery({ queryKey: [SUPPLIERS_KEY, id], queryFn: () => suppliersApi.getById(id!), enabled: !!id });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: CreateSupplierRequest) => suppliersApi.create(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] }) });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: UpdateSupplierRequest) => suppliersApi.update(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] }) });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => suppliersApi.remove(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] }) });
}

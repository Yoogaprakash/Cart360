import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateCustomerRequest, UpdateCustomerRequest } from "../types";
import { customersApi } from "./customersApi";

const CUSTOMERS_KEY = "customers";

export function useCustomersQuery(params: PagedRequest) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: () => customersApi.getPaged(params),
    placeholderData: (previous) => previous
  });
}

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: () => customersApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerRequest) => customersApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] })
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCustomerRequest) => customersApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] })
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] })
  });
}

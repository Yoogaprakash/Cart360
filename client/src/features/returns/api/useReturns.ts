import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreatePurchaseReturnRequest, CreateSalesReturnRequest } from "../types";
import { purchaseReturnsApi, salesReturnsApi } from "./returnsApi";

const SALES_RETURNS_KEY = "sales-returns";
const PURCHASE_RETURNS_KEY = "purchase-returns";
const PRODUCTS_KEY = "products";

export function useSalesReturnsQuery(params: PagedRequest) {
  return useQuery({ queryKey: [SALES_RETURNS_KEY, params], queryFn: () => salesReturnsApi.getPaged(params), placeholderData: (p) => p });
}

export function useSalesReturnQuery(id: string | undefined) {
  return useQuery({ queryKey: [SALES_RETURNS_KEY, id], queryFn: () => salesReturnsApi.getById(id!), enabled: !!id });
}

export function useCreateSalesReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalesReturnRequest) => salesReturnsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_RETURNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    }
  });
}

export function usePurchaseReturnsQuery(params: PagedRequest) {
  return useQuery({ queryKey: [PURCHASE_RETURNS_KEY, params], queryFn: () => purchaseReturnsApi.getPaged(params), placeholderData: (p) => p });
}

export function usePurchaseReturnQuery(id: string | undefined) {
  return useQuery({ queryKey: [PURCHASE_RETURNS_KEY, id], queryFn: () => purchaseReturnsApi.getById(id!), enabled: !!id });
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseReturnRequest) => purchaseReturnsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_RETURNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    }
  });
}

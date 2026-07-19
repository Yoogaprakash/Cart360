import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreatePurchaseRequest } from "../types";
import { purchasesApi } from "./purchasesApi";

const PURCHASES_KEY = "purchases";
const PRODUCTS_KEY = "products";
const SUPPLIERS_KEY = "suppliers";

export function usePurchasesQuery(params: PagedRequest) {
  return useQuery({
    queryKey: [PURCHASES_KEY, params],
    queryFn: () => purchasesApi.getPaged(params),
    placeholderData: (previous) => previous
  });
}

export function usePurchaseQuery(id: string | undefined) {
  return useQuery({
    queryKey: [PURCHASES_KEY, id],
    queryFn: () => purchasesApi.getById(id!),
    enabled: !!id
  });
}

function useInvalidateAfterPurchaseChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [PURCHASES_KEY] });
    queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
  };
}

export function useCreatePurchase() {
  const invalidate = useInvalidateAfterPurchaseChange();
  return useMutation({
    mutationFn: (payload: CreatePurchaseRequest) => purchasesApi.create(payload),
    onSuccess: invalidate
  });
}

export function useRecordPurchasePayment() {
  const invalidate = useInvalidateAfterPurchaseChange();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => purchasesApi.recordPayment(id, amount),
    onSuccess: invalidate
  });
}

export function useCancelPurchase() {
  const invalidate = useInvalidateAfterPurchaseChange();
  return useMutation({
    mutationFn: (id: string) => purchasesApi.cancel(id),
    onSuccess: invalidate
  });
}

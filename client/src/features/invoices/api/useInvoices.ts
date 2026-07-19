import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateInvoiceRequest } from "../types";
import { invoicesApi } from "./invoicesApi";

const INVOICES_KEY = "invoices";
const PRODUCTS_KEY = "products";
const DASHBOARD_KEY = "dashboard";

export function useInvoicesQuery(params: PagedRequest) {
  return useQuery({
    queryKey: [INVOICES_KEY, params],
    queryFn: () => invoicesApi.getPaged(params),
    placeholderData: (previous) => previous
  });
}

export function useInvoiceQuery(id: string | undefined) {
  return useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => invoicesApi.getById(id!),
    enabled: !!id
  });
}

function useInvalidateAfterInvoiceChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
  };
}

export function useCreateInvoice() {
  const invalidate = useInvalidateAfterInvoiceChange();
  return useMutation({
    mutationFn: (payload: CreateInvoiceRequest) => invoicesApi.create(payload),
    onSuccess: invalidate
  });
}

export function useRecordInvoicePayment() {
  const invalidate = useInvalidateAfterInvoiceChange();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => invoicesApi.recordPayment(id, amount),
    onSuccess: invalidate
  });
}

export function useCancelInvoice() {
  const invalidate = useInvalidateAfterInvoiceChange();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.cancel(id),
    onSuccess: invalidate
  });
}

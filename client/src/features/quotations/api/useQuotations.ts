import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateQuotationRequest, QuotationStatus } from "../types";
import { quotationsApi } from "./quotationsApi";

const QUOTATIONS_KEY = "quotations";
const INVOICES_KEY = "invoices";
const PRODUCTS_KEY = "products";

export function useQuotationsQuery(params: PagedRequest) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, params],
    queryFn: () => quotationsApi.getPaged(params),
    placeholderData: (previous) => previous
  });
}

export function useQuotationQuery(id: string | undefined) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, id],
    queryFn: () => quotationsApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuotationRequest) => quotationsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] })
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuotationStatus }) => quotationsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] })
  });
}

export function useConvertQuotationToInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationsApi.convertToInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    }
  });
}

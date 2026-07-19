import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateStockAdjustmentRequest } from "../types";
import { stockAdjustmentsApi } from "./stockAdjustmentsApi";

const STOCK_ADJUSTMENTS_KEY = "stock-adjustments";
const PRODUCTS_KEY = "products";

export function useStockAdjustmentsQuery(params: PagedRequest) {
  return useQuery({ queryKey: [STOCK_ADJUSTMENTS_KEY, params], queryFn: () => stockAdjustmentsApi.getPaged(params), placeholderData: (p) => p });
}

export function useStockAdjustmentQuery(id: string | undefined) {
  return useQuery({ queryKey: [STOCK_ADJUSTMENTS_KEY, id], queryFn: () => stockAdjustmentsApi.getById(id!), enabled: !!id });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStockAdjustmentRequest) => stockAdjustmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STOCK_ADJUSTMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    }
  });
}

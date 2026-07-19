import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateIncomeRequest } from "../types";
import { incomeApi } from "./incomeApi";

const INCOME_KEY = "income";
const INCOME_CATEGORIES_KEY = "income-categories";

export function useIncomeCategoriesQuery() {
  return useQuery({ queryKey: [INCOME_CATEGORIES_KEY], queryFn: incomeApi.getCategories });
}

export function useCreateIncomeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => incomeApi.createCategory(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INCOME_CATEGORIES_KEY] })
  });
}

export function useIncomeQuery(params: PagedRequest) {
  return useQuery({ queryKey: [INCOME_KEY, params], queryFn: () => incomeApi.getPaged(params), placeholderData: (p) => p });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncomeRequest) => incomeApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INCOME_KEY] })
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomeApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INCOME_KEY] })
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import type { CreateExpenseRequest } from "../types";
import { expensesApi } from "./expensesApi";

const EXPENSES_KEY = "expenses";
const EXPENSE_CATEGORIES_KEY = "expense-categories";

export function useExpenseCategoriesQuery() {
  return useQuery({ queryKey: [EXPENSE_CATEGORIES_KEY], queryFn: expensesApi.getCategories });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => expensesApi.createCategory(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSE_CATEGORIES_KEY] })
  });
}

export function useExpensesQuery(params: PagedRequest) {
  return useQuery({ queryKey: [EXPENSES_KEY, params], queryFn: () => expensesApi.getPaged(params), placeholderData: (p) => p });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpenseRequest) => expensesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] })
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] })
  });
}

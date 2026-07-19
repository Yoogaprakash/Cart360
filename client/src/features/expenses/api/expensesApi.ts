import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateExpenseRequest, Expense, ExpenseCategory } from "../types";

export const expensesApi = {
  getCategories: () => apiClient.get<ExpenseCategory[]>("/expenses/categories").then((r) => r.data),
  createCategory: (name: string) => apiClient.post<ExpenseCategory>("/expenses/categories", { name }).then((r) => r.data),
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Expense>>("/expenses", { params }).then((r) => r.data),
  create: (payload: CreateExpenseRequest) => apiClient.post<Expense>("/expenses", payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/expenses/${id}`)
};

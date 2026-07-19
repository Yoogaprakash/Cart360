import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CreateIncomeRequest, Income, IncomeCategory } from "../types";

export const incomeApi = {
  getCategories: () => apiClient.get<IncomeCategory[]>("/incomes/categories").then((r) => r.data),
  createCategory: (name: string) => apiClient.post<IncomeCategory>("/incomes/categories", { name }).then((r) => r.data),
  getPaged: (params: PagedRequest) => apiClient.get<PagedResult<Income>>("/incomes", { params }).then((r) => r.data),
  create: (payload: CreateIncomeRequest) => apiClient.post<Income>("/incomes", payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/incomes/${id}`)
};

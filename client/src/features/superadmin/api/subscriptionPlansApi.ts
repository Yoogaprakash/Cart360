import { apiClient } from "../../../lib/apiClient";
import type { SubscriptionPlan, UpsertSubscriptionPlanRequest } from "../types";

export const subscriptionPlansApi = {
  getAll: () => apiClient.get<SubscriptionPlan[]>("/admin/plans").then((r) => r.data),
  create: (payload: UpsertSubscriptionPlanRequest) => apiClient.post<SubscriptionPlan>("/admin/plans", payload).then((r) => r.data),
  update: (id: string, payload: UpsertSubscriptionPlanRequest) => apiClient.put<SubscriptionPlan>(`/admin/plans/${id}`, payload).then((r) => r.data)
};

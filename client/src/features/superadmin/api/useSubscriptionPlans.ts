import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpsertSubscriptionPlanRequest } from "../types";
import { subscriptionPlansApi } from "./subscriptionPlansApi";

const PLANS_KEY = "admin-plans";

export function useSubscriptionPlansQuery() {
  return useQuery({ queryKey: [PLANS_KEY], queryFn: subscriptionPlansApi.getAll });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertSubscriptionPlanRequest) => subscriptionPlansApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PLANS_KEY] })
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertSubscriptionPlanRequest }) => subscriptionPlansApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PLANS_KEY] })
  });
}

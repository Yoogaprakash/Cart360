import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PagedRequest } from "../../../lib/types";
import { companiesApi } from "./companiesApi";

const COMPANIES_KEY = "admin-companies";

export function useCompaniesQuery(params: PagedRequest) {
  return useQuery({
    queryKey: [COMPANIES_KEY, params],
    queryFn: () => companiesApi.getPaged(params),
    placeholderData: (previous) => previous
  });
}

export function useCompanyActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });

  return {
    approve: useMutation({ mutationFn: companiesApi.approve, onSuccess: invalidate }),
    reactivate: useMutation({ mutationFn: companiesApi.reactivate, onSuccess: invalidate }),
    suspend: useMutation({
      mutationFn: ({ tenantId, reason }: { tenantId: string; reason: string }) => companiesApi.suspend(tenantId, reason),
      onSuccess: invalidate
    }),
    reject: useMutation({
      mutationFn: ({ tenantId, reason }: { tenantId: string; reason: string }) => companiesApi.reject(tenantId, reason),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: companiesApi.remove, onSuccess: invalidate })
  };
}

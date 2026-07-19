import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateCompanySettingsRequest } from "../types";
import { companyApi } from "./companyApi";

const COMPANY_KEY = "company";

export function useMyCompanyQuery() {
  return useQuery({ queryKey: [COMPANY_KEY], queryFn: companyApi.getMine });
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCompanySettingsRequest) => companyApi.updateMine(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] })
  });
}

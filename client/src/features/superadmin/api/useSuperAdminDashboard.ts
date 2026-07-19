import { useQuery } from "@tanstack/react-query";
import { superAdminDashboardApi } from "./superAdminDashboardApi";

export function useSuperAdminDashboardQuery() {
  return useQuery({ queryKey: ["admin-dashboard"], queryFn: superAdminDashboardApi.get });
}

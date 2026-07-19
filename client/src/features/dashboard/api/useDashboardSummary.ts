import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardApi";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardApi.getSummary
  });
}

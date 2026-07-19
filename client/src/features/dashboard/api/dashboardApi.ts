import { apiClient } from "../../../lib/apiClient";

export interface UsageMeter {
  limitType: string;
  current: number;
  max: number;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockProducts: number;
  totalUnits: number;
  planUsage: UsageMeter[];
}

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardSummary>("/dashboard/summary").then((r) => r.data)
};

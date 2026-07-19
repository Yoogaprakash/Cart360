import { apiClient } from "../../../lib/apiClient";
import type { SuperAdminDashboard } from "../types";

export const superAdminDashboardApi = {
  get: () => apiClient.get<SuperAdminDashboard>("/admin/dashboard").then((r) => r.data)
};

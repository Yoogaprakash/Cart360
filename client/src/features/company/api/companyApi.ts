import { apiClient } from "../../../lib/apiClient";
import type { CompanyDetail, UpdateCompanySettingsRequest } from "../types";

export const companyApi = {
  getMine: () => apiClient.get<CompanyDetail>("/company/me").then((r) => r.data),
  updateMine: (payload: UpdateCompanySettingsRequest) => apiClient.put("/company/me", payload)
};

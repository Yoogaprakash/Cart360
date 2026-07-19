import { apiClient } from "../../../lib/apiClient";
import type { PagedRequest, PagedResult } from "../../../lib/types";
import type { CompanyListItem } from "../types";

export const companiesApi = {
  getPaged: (params: PagedRequest) =>
    apiClient.get<PagedResult<CompanyListItem>>("/admin/companies", { params }).then((r) => r.data),

  approve: (tenantId: string) => apiClient.post(`/admin/companies/${tenantId}/approve`),
  reactivate: (tenantId: string) => apiClient.post(`/admin/companies/${tenantId}/reactivate`),
  suspend: (tenantId: string, reason: string) => apiClient.post(`/admin/companies/${tenantId}/suspend`, { reason }),
  reject: (tenantId: string, reason: string) => apiClient.post(`/admin/companies/${tenantId}/reject`, { reason }),
  remove: (tenantId: string) => apiClient.delete(`/admin/companies/${tenantId}`)
};

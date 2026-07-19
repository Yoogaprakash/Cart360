import { apiClient } from "../../../lib/apiClient";
import type { CompanyUser, InviteUserRequest, SetUserPermissionsRequest, UpdateUserStatusRequest } from "../types";

export const usersApi = {
  getAll: () => apiClient.get<CompanyUser[]>("/users").then((r) => r.data),
  invite: (payload: InviteUserRequest) => apiClient.post<CompanyUser>("/users/invite", payload).then((r) => r.data),
  updateStatus: (id: string, payload: UpdateUserStatusRequest) => apiClient.put<CompanyUser>(`/users/${id}/status`, payload).then((r) => r.data),
  setPermissions: (id: string, payload: SetUserPermissionsRequest) => apiClient.put<CompanyUser>(`/users/${id}/permissions`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/users/${id}`)
};

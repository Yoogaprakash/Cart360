import { apiClient } from "../../../lib/apiClient";
import type { CreateUnitRequest, Unit, UpdateUnitRequest } from "../types";

export const unitsApi = {
  getAll: () => apiClient.get<Unit[]>("/units").then((r) => r.data),
  create: (payload: CreateUnitRequest) => apiClient.post<Unit>("/units", payload).then((r) => r.data),
  update: (id: string, payload: UpdateUnitRequest) => apiClient.put<Unit>(`/units/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/units/${id}`)
};

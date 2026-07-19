import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUnitRequest, UpdateUnitRequest } from "../types";
import { unitsApi } from "./unitsApi";

const UNITS_KEY = "units";

export function useUnitsQuery() {
  return useQuery({ queryKey: [UNITS_KEY], queryFn: unitsApi.getAll });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitRequest) => unitsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [UNITS_KEY] })
  });
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUnitRequest) => unitsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [UNITS_KEY] })
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [UNITS_KEY] })
  });
}

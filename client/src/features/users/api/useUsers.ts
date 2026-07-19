import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InviteUserRequest, SetUserPermissionsRequest, UpdateUserStatusRequest } from "../types";
import { usersApi } from "./usersApi";

const USERS_KEY = "users";

export function useUsersQuery() {
  return useQuery({ queryKey: [USERS_KEY], queryFn: usersApi.getAll });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteUserRequest) => usersApi.invite(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserStatusRequest }) => usersApi.updateStatus(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
  });
}

export function useSetUserPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetUserPermissionsRequest }) => usersApi.setPermissions(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] })
  });
}

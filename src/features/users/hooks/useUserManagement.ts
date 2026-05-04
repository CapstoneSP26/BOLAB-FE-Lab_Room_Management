import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userManagementApi } from "../api/userManagementApi";
import type {
  CreateUserRequest,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UserListItem,
} from "../types/userManagement.type";

export const USER_QUERY_KEYS = {
  USERS: "users-management",
} as const;

export const useUsers = (params: GetUsersRequest = {}) =>
  useQuery<GetUsersResponse>({
    queryKey: [USER_QUERY_KEYS.USERS, params],
    queryFn: () => userManagementApi.getUsers(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

interface MutationOptions<TData> {
  onSuccess?: (data: TData, message: string) => void;
  onError?: (error: Error) => void;
}

export const useCreateUser = (
  options: MutationOptions<UserListItem> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => userManagementApi.createUser(payload),
    onSuccess: ({ data, message }) => {
      void queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.USERS],
      });
      options.onSuccess?.(data, message);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useUpdateUser = (
  options: MutationOptions<UserListItem> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserRequest;
    }) => userManagementApi.updateUser(id, payload),
    onSuccess: ({ data, message }) => {
      void queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.USERS],
      });
      options.onSuccess?.(data, message);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useUpdateUserStatus = (
  options: MutationOptions<UserListItem> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => userManagementApi.updateUserStatus(id, isActive),
    onSuccess: ({ data, message }) => {
      void queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.USERS],
      });
      options.onSuccess?.(data, message);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useDeleteUser = (
  options: MutationOptions<void> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userManagementApi.deleteUser(id),
    onSuccess: ({ message }) => {
      void queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.USERS],
      });
      options.onSuccess?.(undefined, message);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

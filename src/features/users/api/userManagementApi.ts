import axiosInstance from "../../../api/axios";
import {
  mapUserDtoToUserListItem,
  normalizeUsersPagedResponse,
  mapRoleToBackendId,
} from "../types/userManagement.mapper";
import type {
  CreateUserRequest,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UserListItem,
  ApiResponse,
} from "../types/userManagement.type";

const USER_API = {
  LIST: "/users",
  CREATE: "/users",
  DETAIL: (id: string) => `/users/${id}`,
  STATUS: (id: string) => `/users/${id}/status`,
  DELETE: (id: string) => `/users/${id}`,
} as const;

const buildListParams = (params: GetUsersRequest = {}) => ({
  keyword: params.q,
  role: params.role ? mapRoleToBackendId(params.role) : undefined,
  isActive: params.isActive,
  page: params.page,
  limit: params.limit,
  pageSize: params.limit,
  sortBy: params.sortBy ?? "CreatedAt",
  isDescending: params.isDescending ?? true,
});

const buildMutationPayload = (
  payload: CreateUserRequest | UpdateUserRequest,
) => ({
  fullName: payload.fullName,
  email: payload.email,
  userCode: payload.userCode,
  roles: payload.roles.map(mapRoleToBackendId),
  password: payload.password,
  isActive: payload.isActive ?? true,
});

export const userManagementApi = {
  async getUsers(params: GetUsersRequest = {}): Promise<GetUsersResponse> {
    const response = await axiosInstance.get(USER_API.LIST, {
      params: buildListParams(params),
    });

    return normalizeUsersPagedResponse(response.data);
  },

  async getUserById(id: string): Promise<UserListItem> {
    const response = await axiosInstance.get<ApiResponse<unknown>>(
      USER_API.DETAIL(id),
    );

    if (!response.data.success) {
      throw new Error(response.data.message ?? "Failed to get user");
    }

    return mapUserDtoToUserListItem(response.data.data);
  },

  async createUser(
    payload: CreateUserRequest,
  ): Promise<{ data: UserListItem; message: string }> {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      USER_API.CREATE,
      buildMutationPayload(payload),
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      data: mapUserDtoToUserListItem(response.data.data),
      message: response.data.message,
    };
  },

  async updateUser(
    id: string,
    payload: UpdateUserRequest,
  ): Promise<{ data: UserListItem; message: string }> {
    const response = await axiosInstance.put<ApiResponse<unknown>>(
      USER_API.DETAIL(id),
      buildMutationPayload(payload),
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      data: mapUserDtoToUserListItem(response.data.data),
      message: response.data.message,
    };
  },

  async updateUserStatus(
    id: string,
    isActive: boolean,
  ): Promise<{ data: UserListItem; message: string }> {
    const response = await axiosInstance.patch<ApiResponse<unknown>>(
      USER_API.STATUS(id),
      {
        isActive,
      },
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      data: mapUserDtoToUserListItem(response.data.data),
      message: response.data.message,
    };
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<ApiResponse<unknown>>(
      USER_API.DELETE(id),
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      message: response.data.message,
    };
  },
};

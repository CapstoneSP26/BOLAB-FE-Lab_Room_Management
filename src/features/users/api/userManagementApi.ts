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
} from "../types/userManagement.type";

const USER_API = {
  LIST: "/users",
  CREATE: "/users",
  DETAIL: (id: string) => `/users/${id}`,
  STATUS: (id: string) => `/users/${id}/status`,
  DELETE: (id: string) => `/users/${id}`,
} as const;

const buildListParams = (params: GetUsersRequest = {}) => ({
  q: params.q,
  keyword: params.q,
  searchTerm: params.q,
  role: params.role,
  isActive: params.isActive,
  page: params.page,
  pageNumber: params.page,
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

  async createUser(payload: CreateUserRequest): Promise<UserListItem> {
    const response = await axiosInstance.post(
      USER_API.CREATE,
      buildMutationPayload(payload),
    );

    return mapUserDtoToUserListItem(response.data);
  },

  async updateUser(id: string, payload: UpdateUserRequest): Promise<UserListItem> {
    const response = await axiosInstance.put(
      USER_API.DETAIL(id),
      buildMutationPayload(payload),
    );

    return mapUserDtoToUserListItem(response.data);
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<UserListItem> {
    const response = await axiosInstance.patch(USER_API.STATUS(id), {
      isActive,
    });

    return mapUserDtoToUserListItem(response.data);
  },

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(USER_API.DELETE(id));
  },
};

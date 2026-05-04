import type { PagedResponse } from "../../../types/pagination.types";

export type UserRole = "ADMIN" | "LAB_MANAGER" | "LECTURER" | "STUDENT";
export type UserStatusFilter = "ALL" | "ACTIVE" | "DEACTIVATED";
export type UserSortOrder = "ASC" | "DESC";

export interface ResultMessage<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserListItem {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  roles: UserRole[];
  primaryRole: UserRole;
  createdAt: string;
  updatedAt?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface UserFormValues {
  fullName: string;
  email: string;
  userCode: string;
  roles: UserRole[];
  password: string;
  isActive: boolean;
}

export interface GetUsersRequest {
  q?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  isDescending?: boolean;
}

export interface UserMutationPayload {
  fullName: string;
  email: string;
  userCode?: string;
  roles: UserRole[];
  password?: string;
  isActive?: boolean;
}

export interface CreateUserRequest extends UserMutationPayload {
  password: string;
}

export type UpdateUserRequest = UserMutationPayload;

export type GetUsersResponse = PagedResponse<UserListItem>;

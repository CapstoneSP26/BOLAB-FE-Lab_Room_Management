// src/features/auth/api/auth.api.ts
import { axiosInstance } from "../../../api";
import type { UserAuth } from "../types/auth.types";

export interface ChangeRoleResponse {
  success: boolean;
  redirectUrl?: string;
  message?: string;
}

export const authApi = {
  /**
   * Lấy thông tin người dùng hiện tại dựa trên Cookie
   * Backend sẽ giải mã Cookie và trả về thông tin User
   */
  getProfile: async (): Promise<UserAuth> => {
    const response = await axiosInstance.get<UserAuth>("/auth/profile");
    return response.data;
  },

  /**
   * Lấy danh sách các role của người dùng hiện tại
   */
  getUserRoles: async (): Promise<number[]> => {
    const response = await axiosInstance.get<number[]>("/auth/user-roles");
    return response.data;
  },

  /**
   * Đổi role
   * @param roleId - ID của role muốn đổi sang
   */
  changeRole: async (roleId: number): Promise<ChangeRoleResponse> => {
    const response = await axiosInstance.post<ChangeRoleResponse>(
      `/auth/change-role/${roleId}`
    );
    return response.data;
  },

  /**
   * Đăng xuất
   * Backend sẽ xóa Cookie accessToken trên trình duyệt
   */
  logout: async (): Promise<void> => {
    await axiosInstance.get("/auth/sign-out");
  },
};
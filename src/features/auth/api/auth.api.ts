// src/features/auth/api/auth.api.ts
import { axiosInstance } from "../../../api";
import type { UserAuth } from "../types/auth.types";


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
   * Đăng xuất
   * Backend sẽ xóa Cookie accessToken trên trình duyệt
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
};
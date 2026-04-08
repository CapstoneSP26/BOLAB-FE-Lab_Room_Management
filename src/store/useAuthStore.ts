// src/store/useAuthStore.ts
import { create } from 'zustand';
import { authApi } from '../features/auth/api/auth.api';
import type { UserAuth } from '../features/auth/types/auth.types';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { getAccessToken } from '../utils/storage';

interface UserPayload {
  sub: string;
  email: string;
  campusId: string;
  role: string;
}

interface AuthState {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Hành động kiểm tra trạng thái đăng nhập
  checkAuth: () => Promise<void>;

  setAuth: (user: UserAuth | null) => void;

  // Hành động Logout
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định là true để tránh bị redirect nhầm khi chưa fetch xong

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // API này sẽ dựa vào Cookie HttpOnly để nhận diện User
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setAuth: (user: UserAuth | null) => {
    set({ user, isAuthenticated: user ? true : false, isLoading: false });
  },

  logout: async () => {
    try {
      await authApi.logout(); // Gọi BE để xóa Cookie
    } finally {
      set({ user: null, isAuthenticated: false });
      window.location.href = '/login';
    }
  }
}));
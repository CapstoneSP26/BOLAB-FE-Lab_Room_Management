import { create } from 'zustand';
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
  user: UserPayload | null;
  isAuthenticated: boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  initialize: () => {
    const cookieToken = Cookies.get('accessToken');
    const localToken = getAccessToken();
    const token = localToken || cookieToken;

    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const decoded = jwtDecode<UserPayload>(token);
      set({ user: decoded, isAuthenticated: true });
    } catch (error) {
      console.error("Token invalid or expired");
      Cookies.remove('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  }
}));
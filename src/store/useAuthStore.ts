import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

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
    const token = Cookies.get('token'); // Tên cookie tùy vào Backend đặt
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        set({ user: decoded, isAuthenticated: true });
      } catch (error) {
        console.error("Token invalid or expired");
        Cookies.remove('token');
        set({ user: null, isAuthenticated: false });
      }
    }
  }
}));
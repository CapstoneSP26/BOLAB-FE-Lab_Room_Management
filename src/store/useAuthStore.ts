import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

// Backend JWT claims (from AuthController)
interface UserPayload {
  Id: string;        // User ID (GUID) from backend instead of "sub"
  Role: string;      // RoleId from backend
  CampusId: string;  // CampusId from backend
  iat?: number;
  exp?: number;
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
    let token: string | undefined;
    
    // Step 1: Check URL query params (backend might return token after OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get('token') || urlParams.get('accessToken');
    
    if (tokenFromURL) {
      console.log('🔗 Token found in URL param');
      token = tokenFromURL;
      // Save to localStorage for future requests
      localStorage.setItem('access_token', token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Step 2: Check cookies
    if (!token) {
      token = Cookies.get('accessToken');
      if (token) {
        console.log('🍪 Token found in cookie');
      }
    }
    
    // Step 3: Check localStorage (from previous session or OAuth redirect)
    if (!token) {
      const localToken = localStorage.getItem('access_token');
      if (localToken) {
        console.log('💾 Token found in localStorage');
        token = localToken;
      }
    }
    
    if (token) {
      try {
        console.log('🔐 Decoding JWT token...');
        const decoded = jwtDecode<UserPayload>(token);
        console.log('🔐 JWT Decoded:', decoded);
        
        // DEBUG: Log all claims
        console.log('🔐 ALL JWT Claims:', token);
        try {
          const fullDecoded = jwtDecode<any>(token);
          console.log('🔐 FULL Claims Object:', JSON.stringify(fullDecoded, null, 2));
          console.log('🔐 Role Claim Value:', fullDecoded.Role);
          console.log('🔐 Role Type:', typeof fullDecoded.Role);
        } catch(e) {
          console.error('Error logging full claims:', e);
        }
        
        set({ user: decoded, isAuthenticated: true });
      } catch (error) {
        console.error("❌ Token invalid or expired", error);
        Cookies.remove('accessToken');
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
      }
    } else {
      console.log('⚠️ No token found in URL, cookies, or localStorage');
    }
  }
}));
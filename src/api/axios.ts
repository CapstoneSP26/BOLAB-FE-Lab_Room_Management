import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuth,
  getAccessToken,
} from "../utils/storage";

/**
 * Helper: Extract JWT token from cookies (if it's not HttpOnly)
 * Some browsers/configs allow reading non-HttpOnly cookies
 */
const extractTokenFromCookie = (): string | null => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'accessToken' || name === 'access_token') {
        return decodeURIComponent(value);
      }
    }
  } catch (err) {
    console.error('Error reading cookies:', err);
  }
  return null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
console.log("VITE_API_BASE_URL =", API_BASE_URL);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try multiple sources for token
    let token = getAccessToken(); // First try: localStorage
    if (!token) {
      token = extractTokenFromCookie(); // Second try: cookies
    }
    
    console.log("Request baseURL:", config.baseURL);
    console.log("Request url:", config.url);
    console.log("Full request:", `${config.baseURL}${config.url}`);
    console.log("Token source:", token ? (getAccessToken() ? "localStorage ✅" : "cookie ✅") : "❌ Not found");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization: Bearer [token]");
    }
    
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // If 401 Unauthorized, redirect to login
    // Backend manages HttpOnly cookies - no manual token refresh needed
    if (error.response?.status === 401) {
      console.log("⚠️ 401 Unauthorized - Redirecting to login");
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
export {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "../utils/storage";

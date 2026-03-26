import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "../utils/storage";
import { defaultMockProfile } from "../features/profile/mocks/profileMocks";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

console.log("VITE_API_BASE_URL =", API_BASE_URL);
console.log("VITE_USE_MOCK_DATA =", USE_MOCK_DATA);

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
    const token = getAccessToken();

    console.log("Request baseURL:", config.baseURL);
    console.log("Request url:", config.url);
    console.log("Full request:", `${config.baseURL}${config.url}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ============================================
// 🔷 MOCK INTERCEPTOR - Handles mocked endpoints
// ============================================
function setupMockInterceptor() {
  axiosInstance.interceptors.response.use(
    async (response) => {
      // For successful mock responses, pass through
      return response;
    },
    async (error: AxiosError) => {
      // If mock mode is enabled, try to handle with mock data first
      if (USE_MOCK_DATA && error.config) {
        const url = error.config.url || "";
        const method = error.config.method?.toUpperCase() || "GET";

        console.log(`[MOCK] Intercepting ${method} ${url}`);

        // Mock GET /users/me or /me (User Profile)
        if ((url.includes("/users/me") || url.includes("/me")) && method === "GET") {
          console.log("[MOCK] Returning mock user profile");
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 300));
          return Promise.resolve({
            config: error.config,
            status: 200,
            statusText: "OK",
            headers: {},
            data: defaultMockProfile,
          });
        }

        // Mock PUT /users/me or /me (Update Profile)
        if ((url.includes("/users/me") || url.includes("/me")) && method === "PUT") {
          console.log("[MOCK] Returning mocked update profile response");
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 300));
          const requestBody = error.config.data;
          return Promise.resolve({
            config: error.config,
            status: 200,
            statusText: "OK",
            headers: {},
            data: requestBody
              ? JSON.parse(typeof requestBody === "string" ? requestBody : JSON.stringify(requestBody))
              : defaultMockProfile,
          });
        }
      }

      // If not mocked, pass to next error handler
      return Promise.reject(error);
    },
  );
}

// Initialize mock interceptor
setupMockInterceptor();

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearAuth();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          },
        );

        const newAccessToken = response.data.accessToken;
        saveAccessToken(newAccessToken);

        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

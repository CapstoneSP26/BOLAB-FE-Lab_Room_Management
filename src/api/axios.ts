import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuth,
  getAccessToken,
} from "../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

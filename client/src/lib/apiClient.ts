import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../store/authStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 caused by an expired access token is retried, once, after a silent refresh.
// Concurrent 401s while a refresh is already in flight all await the same promise
// instead of each firing their own /auth/refresh call.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    authStorage.updateTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    authStorage.clear();
    return null;
  }
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

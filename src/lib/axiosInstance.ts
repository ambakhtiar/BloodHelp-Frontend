import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

// ---------- In-Memory Token Store ----------
let inMemoryAccessToken: string | null = null;

export const getAccessToken = (): string | null => inMemoryAccessToken;

export const setAccessToken = (token: string): void => {
  inMemoryAccessToken = token;
};

export const removeAccessToken = (): void => {
  inMemoryAccessToken = null;
};

// ---------- Silent Refresh (called on app boot) ----------
interface RefreshResponse {
  data: { accessToken: string };
}

export const silentRefresh = async (): Promise<string> => {
  const response = await axios.post<RefreshResponse>(
    `${BASE_URL}/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
  const token = response.data.data.accessToken;
  setAccessToken(token);
  return token;
};

// ---------- Axios Instance ----------
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ---------- Request Interceptor ----------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ---------- Response Interceptor (Refresh Token Queue) ----------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
};

interface ApiErrorResponse {
  message?: string;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isUnauthorized = error.response?.status === 401;
    const isNotRefreshEndpoint = !originalRequest?.url?.includes(
      "/auth/refresh-token"
    );

    if (isUnauthorized && isNotRefreshEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await silentRefresh();
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

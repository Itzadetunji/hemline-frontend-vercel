import { CONFIGS } from "@/configs";
import { userSignal, userStore } from "@/stores/userStore";
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { USERS_ENDPOINTS } from "./v1/users/users.api";

const baseURL = `${CONFIGS.URL.API_BASE_URL}/v${CONFIGS.URL.API_VERSION}`;

// Create new axios instance
const $http: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "max-age=604800, must-revalidate",
  },
  withCredentials: true,
});

// Track refresh token promise to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ============= REQUEST INTERCEPTOR =============
$http.interceptors.request.use(
  (config) => {
    const token = userSignal.value?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        config.headers["Content-Type"] = "multipart/form-data";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============= RESPONSE INTERCEPTOR =============
$http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return $http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh token endpoint
        const response = await axios
          .post(
            baseURL + USERS_ENDPOINTS.refreshToken,
            {},
            {
              timeout: 30000,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "max-age=604800, must-revalidate",
              },
              withCredentials: true,
            }
          )
          .then((res) => res.data);

        if (response.success && response.data.access_token) {
          const newAccessToken = response.data.access_token;

          // Update the user store with new token - await so persist completes
          await userStore.updateUser({
            access_token: newAccessToken,
            user: response.data.user,
          });

          // Update the authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Process all queued requests with new token
          processQueue(null, newAccessToken);

          // Retry the original request
          return $http(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as AxiosError, null);
        userStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default $http;

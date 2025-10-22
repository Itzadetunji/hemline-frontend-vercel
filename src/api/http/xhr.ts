import { CONFIGS } from "@/configs";
import { userSignal } from "@/stores/userStore";
import axios, { type AxiosInstance } from "axios";

const baseURL = `${CONFIGS.URL.API_BASE_URL}/v${CONFIGS.URL.API_VERSION}`;

// Create new axios instance
const $http: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

$http.interceptors.request.use(
  (config) => {
    // Add Bearer token
    const token = userSignal.value?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default $http;

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
    "Cache-Control": "max-age=604800, must-revalidate",
  },
});

$http.interceptors.request.use(
  (config) => {
    // Add Bearer token
    const token = userSignal.value?.token;
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

// Response interceptor to delay all responses by 5 seconds
// $http.interceptors.response.use(
//   async (response) => {
//     await new Promise((resolve) => setTimeout(resolve, 5000));
//     return response;
//   },
//   async (error) => {
//     await new Promise((resolve) => setTimeout(resolve, 5000));
//     return Promise.reject(error);
//   }
// );

export default $http;

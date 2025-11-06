import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://13.239.7.174";

// ============================================
// AXIOS INSTANCE
// ============================================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const errorMessage =
        (error.response.data as { message?: string; error?: string })?.message ||
        (error.response.data as { message?: string; error?: string })?.error ||
        "Đã xảy ra lỗi không xác định";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } else {
      throw new Error(error.message || "Đã xảy ra lỗi không xác định");
    }
  }
);
export default apiClient;


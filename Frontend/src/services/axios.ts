// src/services/axios.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://api.bloodconnect.cloud";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: false
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    
    // Kiểm tra token expiration trước khi gửi request
    if (tokenExpiry) {
      const expirationTime = parseInt(tokenExpiry, 10);
      const now = Date.now();
      
      // Nếu token đã hết hạn, xóa token và redirect về login
      if (now >= expirationTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        localStorage.removeItem("tokenExpiry");
        sessionStorage.removeItem("token");
        
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
        
        return Promise.reject(new Error("Token đã hết hạn. Vui lòng đăng nhập lại."));
      }
    }
    
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Nếu token hết hạn (401 Unauthorized), xóa token và redirect về login
    if (error.response?.status === 401) {
      // Xóa tất cả thông tin xác thực
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      localStorage.removeItem("tokenExpiry");
      sessionStorage.removeItem("token");
      
      // Redirect về login page
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    // Giữ nguyên error object để có thể check status code
    if (error.response) {
      const payload = error.response.data as any;
      const msg = payload?.message || payload?.error || "Đã xảy ra lỗi không xác định";
      // Tạo error mới nhưng giữ nguyên response để check status
      const customError: any = new Error(msg);
      customError.response = error.response;
      customError.status = error.response.status;
      throw customError;
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } else {
      throw new Error(error.message || "Đã xảy ra lỗi không xác định");
    }
  }
);

export default apiClient;
// 👇 để import dạng { api } nếu bạn thích
export const api = apiClient;

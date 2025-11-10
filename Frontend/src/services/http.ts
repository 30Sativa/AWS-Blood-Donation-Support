// src/services/http.ts
import axios, { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios"; // <-- type-only import

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // bật nếu backend yêu cầu cookie
  timeout: 20000,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // đảm bảo headers là AxiosHeaders
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  } else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers as any);
  }

  // Content-Type mặc định JSON
  (config.headers as AxiosHeaders).set("Content-Type", "application/json");

  // Gắn Bearer token nếu có
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// RESPONSE INTERCEPTOR: chuẩn hoá lỗi
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const data: any = err.response?.data;
    const message =
      (typeof data === "string" && data) ||
      data?.message ||
      err.message ||
      "Request failed";
    return Promise.reject(new Error(`[${status ?? "ERR"}] ${message}`));
  }
);

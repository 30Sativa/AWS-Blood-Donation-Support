import apiClient from "@/services/axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

// Type cho response từ backend (BaseResponse<LoginResponse>)
interface BackendLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: number;
      email: string;
      fullname: string;
      cognitoUserId: string;
    };
    roles: string[];
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Gọi API login (không cần token, interceptor sẽ không thêm nếu chưa có)
      const response = await apiClient.post<BackendLoginResponse>(
        "/api/Users/login",
        credentials
      );
      
      const backendData = response.data;

      // Nếu backend trả về error (success: false) nhưng status 200
      if (!backendData.success || !backendData.data) {
        throw new Error(backendData.message || "Login failed");
      }

      const { accessToken, user, roles } = backendData.data;

      // Map sang AuthResponse format (giữ nguyên để LoginPage.tsx không cần sửa)
      return {
        token: accessToken,
        refreshToken: backendData.data.refreshToken,
        expiresIn: backendData.data.expiresIn,
        user: {
          id: String(user.id),
          email: user.email,
          fullName: user.fullname,
        },
        roles: roles,
        message: backendData.message,
        success: backendData.success,
      } as AuthResponse;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Xử lý lỗi network
      if (error.message?.includes("Network Error") || error.code === "ECONNABORTED" || error.message?.includes("không thể kết nối")) {
        throw new Error(
          `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
          `1. Backend có đang chạy không?\n` +
          `2. URL backend: ${apiClient.defaults.baseURL}\n` +
          `3. Endpoint: /api/Users/login`
        );
      }
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Gọi API register (không cần token)
      const response = await apiClient.post<BackendLoginResponse>(
        "/api/Users/register",
        userData
      );
      
      const backendData = response.data;

      // Nếu backend trả về error (success: false) nhưng status 200
      if (!backendData.success || !backendData.data) {
        throw new Error(backendData.message || "Registration failed");
      }

      const { accessToken, user, roles } = backendData.data;

      // Map sang AuthResponse format (giữ nguyên để LoginPage.tsx không cần sửa)
      return {
        token: accessToken,
        refreshToken: backendData.data.refreshToken,
        expiresIn: backendData.data.expiresIn,
        user: {
          id: String(user.id),
          email: user.email,
          fullName: user.fullname,
        },
        roles: roles,
        message: backendData.message,
        success: backendData.success,
      } as AuthResponse;
    } catch (error: any) {
      console.error("Register error:", error);
      throw error;
    }
  },
};

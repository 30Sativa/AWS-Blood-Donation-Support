
import apiClient from "@/services/axios";
import type { LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest } from "@/types/auth";


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

  async register(userData: RegisterRequest): Promise<{ message?: string; success?: boolean }> {
    try {
      // Gọi API register (không cần token)
      const response = await apiClient.post<{ success: boolean; message?: string; data?: any }>(
        "/api/Users/register",
        userData
      );
      
      const backendData = response.data;

      // Nếu backend trả về error (success: false) nhưng status 200
      if (!backendData.success) {
        throw new Error(backendData.message || "Registration failed");
      }

      // Register chỉ trả về success message, không có user data (cần confirm email trước)
      return {
        message: backendData.message || "Registration successful! Please check your email for confirmation code.",
        success: backendData.success,
      };
    } catch (error: any) {
      console.error("Register error:", error);
      throw error;
    }
  },

  async requestPasswordReset(data: ForgotPasswordRequest): Promise<{ message?: string; success?: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        "/api/Users/forgot-password",
        {
          email: data.email,
        }
      );

      const backendData = response.data;

      if (!backendData.success) {
        throw new Error(backendData.message || "Không thể gửi mã xác nhận");
      }

      return {
        message: backendData.message || "Mã xác nhận đã được gửi đến email của bạn!",
        success: backendData.success,
      };
    } catch (error: any) {
      console.error("Request password reset error:", error);
      throw error;
    }
  },

  async verifyOTP(data: VerifyOTPRequest): Promise<{ message?: string; success?: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        "/api/Users/confirm-email",
        {
          email: data.email,
          confirmationCode: data.confirmationCode,
        }
      );

      const backendData = response.data;

      if (!backendData.success) {
        throw new Error(backendData.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn");
      }

      return {
        message: backendData.message,
        success: backendData.success,
      };
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message?: string; success?: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        "/api/Users/reset-password",
        {
          request: {
            email: data.email,
            newPassword: data.newPassword,
            confirmationCode: data.confirmationCode,
          },
        }
      );

      const backendData = response.data;

      if (!backendData.success) {
        throw new Error(backendData.message || "Không thể đặt lại mật khẩu");
      }

      return {
        message: backendData.message || "Đặt lại mật khẩu thành công!",
        success: backendData.success,
      };
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    }
  },
};

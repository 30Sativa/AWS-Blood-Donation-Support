import type { LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest } from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://13.239.7.174";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Đã xảy ra lỗi không xác định",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const loginUrl = `${API_BASE_URL}/api/Users/login`;
    console.log("Login URL:", loginUrl);
    console.log("API_BASE_URL:", API_BASE_URL);
    
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // Parse raw response and normalize to AuthResponse shape
      const raw = await handleResponse<Record<string, unknown>>(response);

      // Try common locations for tokens depending on backend shape
      const token = (raw?.token
        || (raw?.data as Record<string, unknown>)?.accessToken
        || (raw?.data as Record<string, unknown>)?.access_token
        || raw?.accessToken
        || raw?.access_token) as string | undefined;

      const user = (raw?.user || (raw?.data as Record<string, unknown>)?.user || (raw?.data as Record<string, unknown>)?.userInfo) as AuthResponse['user'] | undefined;

      return {
        token,
        user,
        message: raw?.message as string | undefined,
        success: raw?.success as boolean | undefined,
      } as AuthResponse;
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
          `1. Backend có đang chạy không?\n` +
          `2. URL backend: ${API_BASE_URL}\n` +
          `3. Endpoint: /api/Users/login`
        );
      }
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Normalize register response similarly
    const raw = await handleResponse<Record<string, unknown>>(response);

    const token = (raw?.token || (raw?.data as Record<string, unknown>)?.accessToken || (raw?.data as Record<string, unknown>)?.access_token || raw?.accessToken) as string | undefined;
    const user = (raw?.user || (raw?.data as Record<string, unknown>)?.user || (raw?.data as Record<string, unknown>)?.userInfo) as AuthResponse['user'] | undefined;

    return {
      token,
      user,
message: raw?.message as string | undefined,
      success: raw?.success as boolean | undefined,
    } as AuthResponse;
  },

  async requestPasswordReset(data: ForgotPasswordRequest): Promise<{ message?: string; success?: boolean }> {
    console.log("🔍 Requesting password reset for:", data.email);
    console.log("�� API URL:", `${API_BASE_URL}/api/Users/forgot-password`);
    
    const response = await fetch(`${API_BASE_URL}/api/Users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("�� Response status:", response.status, response.statusText);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

    const raw = await response.json().catch(() => ({
      message: "Đã xảy ra lỗi không xác định",
      success: false,
    }));

    console.log("📦 Response data:", JSON.stringify(raw, null, 2));

    if (!response.ok || raw.success === false) {
      console.error("❌ Error:", raw.message);
      throw new Error(raw.message || "Không thể gửi mã xác nhận");
    }

    console.log("✅ Success:", raw.message);
    return {
      message: raw?.message as string | undefined,
      success: raw?.success as boolean | undefined,
    };
  },

  async verifyOTP(data: VerifyOTPRequest): Promise<{ message?: string; success?: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/Users/confirm-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        confirmationCode: data.confirmationCode,
      }),
    });

    const raw = await response.json().catch(() => ({
      message: "Đã xảy ra lỗi không xác định",
      success: false,
    }));

    if (!response.ok || raw.success === false) {
      throw new Error(raw.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn");
    }

    return {
      message: raw?.message as string | undefined,
      success: raw?.success as boolean | undefined,
    };
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message?: string; success?: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/Users/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: {
          email: data.email,
          newPassword: data.newPassword,
          confirmationCode: data.confirmationCode,
        },
      }),
    });

    const raw = await response.json().catch(() => ({
      message: "Đã xảy ra lỗi không xác định",
      success: false,
    }));

    if (!response.ok || raw.success === false) {
      throw new Error(raw.message || "Không thể đặt lại mật khẩu");
    }

    return {
      message: raw?.message as string | undefined,
      success: raw?.success as boolean | undefined,
    };
  },
};

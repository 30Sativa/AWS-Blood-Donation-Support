import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

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
};

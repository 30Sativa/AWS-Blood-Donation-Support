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
    const response = await fetch(`${API_BASE_URL}/api/Users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    // Parse raw response and normalize to AuthResponse shape
    const raw = await handleResponse<any>(response);

    // Try common locations for tokens depending on backend shape
    const token = raw?.token
      || raw?.data?.accessToken
      || raw?.data?.access_token
      || raw?.accessToken
      || raw?.access_token;

    const user = raw?.user || raw?.data?.user || raw?.data?.userInfo || undefined;

    return {
      token,
      user,
      message: raw?.message,
      success: raw?.success,
    } as AuthResponse;
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
    const raw = await handleResponse<any>(response);

    const token = raw?.token || raw?.data?.accessToken || raw?.data?.access_token || raw?.accessToken;
    const user = raw?.user || raw?.data?.user || raw?.data?.userInfo || undefined;

    return {
      token,
      user,
      message: raw?.message,
      success: raw?.success,
    } as AuthResponse;
  },
};


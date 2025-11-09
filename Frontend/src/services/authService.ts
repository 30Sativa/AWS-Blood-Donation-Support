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

      // Backend returns BaseResponse<LoginResponse>
      const raw = await handleResponse<Record<string, any>>(response);

      const data = (raw.data ?? raw) as Record<string, any>;

      const token =
        data.accessToken ??
        data.access_token ??
        raw.token ??
        raw.accessToken ??
        raw.access_token;

      const user =
        (data.user ?? raw.user ?? data.userInfo) as AuthResponse["user"];

      const roles = (data.roles ?? raw.roles) as string[] | undefined;

      return {
        token,
        refreshToken: data.refreshToken ?? data.refresh_token,
        expiresIn:
          typeof data.expiresIn === "number"
            ? data.expiresIn
            : typeof data.expires_in === "number"
              ? data.expires_in
              : undefined,
        user,
        roles,
        message: raw.message as string | undefined,
        success: raw.success as boolean | undefined,
      };
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
          `1. Backend có đang chạy không?\n` +
          `2. URL backend: ${API_BASE_URL}\n` +
          `3. Endpoint: /api/Users/login`,
        );
      }
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const url = `${API_BASE_URL}/api/Users/register`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Backend also returns BaseResponse<Something>
    const raw = await handleResponse<Record<string, any>>(response);
    const data = (raw.data ?? raw) as Record<string, any>;

    const token =
      data.accessToken ??
      data.access_token ??
      raw.token ??
      raw.accessToken ??
      raw.access_token;

    const user =
      (data.user ?? raw.user ?? data.userInfo) as AuthResponse["user"];

    const roles = (data.roles ?? raw.roles) as string[] | undefined;

    return {
      token,
      refreshToken: data.refreshToken ?? data.refresh_token,
      expiresIn:
        typeof data.expiresIn === "number"
          ? data.expiresIn
          : typeof data.expires_in === "number"
            ? data.expires_in
            : undefined,
      user,
      roles,
      message: raw.message as string | undefined,
      success: raw.success as boolean | undefined,
    };
  },
};

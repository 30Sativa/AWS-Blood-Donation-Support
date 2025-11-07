import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import axios, { AxiosHeaders } from 'axios';
import { ACCESS_TOKEN, USER, commonSettings, REFRESH_TOKEN} from '@/utils/setting';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.bloodconnect.cloud';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

httpClient.interceptors.request.use((config) => {
  const token = commonSettings.getStorage<string>(ACCESS_TOKEN);
  if (!config.headers) config.headers = new AxiosHeaders();
  const headers: any = config.headers as any;
  // Support both AxiosHeaders and plain object
  if (typeof (headers as any).set === 'function') {
    headers.set('Accept', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers['Accept'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ----------------------
// Proactive refresh (every ~30 minutes)
// ----------------------
let refreshTimer: number | undefined;

function getRefreshRecord(): { value: string; expiry?: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REFRESH_TOKEN);
    return raw ? (JSON.parse(raw) as { value: string; expiry?: number }) : null;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const record = getRefreshRecord();
  const storedRefreshToken = record?.value;
  if (!storedRefreshToken) return null;

  try {
    const res = await httpClient.post(
      '/api/Users/refresh-token',
      JSON.stringify(storedRefreshToken),
      { headers: { 'Content-Type': 'application/json' } }
    );
    const raw = res.data;
    const newAccessToken =
      (typeof raw === 'string' ? raw : undefined) ||
      raw?.token || raw?.accessToken || raw?.data?.accessToken || raw?.data?.token;
    const newRefreshToken =
      raw?.refreshToken || raw?.data?.refreshToken || raw?.data?.refresh_token || raw?.refresh_token;

    if (newAccessToken) {
      commonSettings.setStorage(ACCESS_TOKEN, newAccessToken);
    }
    // reset refresh token TTL to 30 minutes on every refresh
    if (newRefreshToken) {
      commonSettings.setStorage(REFRESH_TOKEN, newRefreshToken, 30 * 60 * 1000);
    } else if (storedRefreshToken) {
      commonSettings.setStorage(REFRESH_TOKEN, storedRefreshToken, 30 * 60 * 1000);
    }

    return newAccessToken ?? null;
  } catch {
    commonSettings.clearStorageItem(ACCESS_TOKEN);
    commonSettings.clearStorageItem(REFRESH_TOKEN);
    return null;
  }
}

function scheduleProactiveRefresh() {
  if (typeof window === 'undefined') return;
  if (refreshTimer) window.clearInterval(refreshTimer);

  // tick every 60s to check expiry
  refreshTimer = window.setInterval(async () => {
    const record = getRefreshRecord();
    const expiry = record?.expiry ?? 0;
    const timeLeft = expiry - Date.now();
    // if less than or equal to 60s left, refresh now
    if (record?.value && (isNaN(timeLeft) || timeLeft <= 60 * 1000)) {
      await refreshAccessToken();
    }
  }, 60 * 1000);
}

type ApiFieldError = { field: string; error: string };
type ApiErrorShape = {
  success?: boolean;
  message?: string;
  errors?: ApiFieldError[];
  traceId?: string;
  timestamp?: string;
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await httpClient.post('/api/Users/login', credentials);
      const raw = res.data ?? {};

      const token =
        raw?.token ||
        raw?.data?.accessToken ||
        raw?.data?.access_token ||
        raw?.accessToken ||
        raw?.access_token;

      const refreshToken =
        raw?.refreshToken ||
        raw?.data?.refreshToken ||
        raw?.data?.refresh_token ||
        raw?.refresh_token;

      const user = raw?.user || raw?.data?.user || raw?.data?.userInfo || undefined;

      if (token) commonSettings.setStorage(ACCESS_TOKEN, token);
      if (refreshToken) {
        // store with 30 minutes TTL
        commonSettings.setStorage(REFRESH_TOKEN, refreshToken, 30 * 60 * 1000);
        scheduleProactiveRefresh();
      }
      if (user) commonSettings.setStorageJson(USER, user);

      return {
        token,
        user,
        message: raw?.message,
        success: raw?.success ?? true,
      } as AuthResponse;
    } catch (err: any) {
      const status = err?.response?.status;
      const data = (err?.response?.data ?? {}) as ApiErrorShape;
      const normalized = {
        success: data?.success ?? false,
        message: data?.message || 'Đăng nhập thất bại',
        fieldErrors: Array.isArray(data?.errors) ? data.errors : undefined,
        traceId: data?.traceId,
        timestamp: data?.timestamp,
        status,
      };
      throw normalized;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await httpClient.post('/api/Users/register', data);
    const raw = res.data ?? {};

    // Register API response structure: { success, message, data: { id, email, fullname, cognitoUserId } }
    // Note: Register doesn't return token, user needs to login after registration
    const registerData = raw?.data;
    const user = registerData
      ? {
          id: registerData.id?.toString() || '',
          email: registerData.email || '',
          fullname: registerData.fullname || '',
          cognitoUserId: registerData.cognitoUserId || '',
        }
      : undefined;

    // Don't store token for register (no token in response)
    // Don't store user either since they need to login first

    return {
      token: undefined, // Register doesn't return token
      user,
      message: raw?.message,
      success: raw?.success ?? true,
    } as AuthResponse;
  },
};

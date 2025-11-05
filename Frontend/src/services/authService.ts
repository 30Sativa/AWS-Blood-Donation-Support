import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import axios, { AxiosHeaders } from 'axios';
import { ACCESS_TOKEN, USER, commonSettings } from '@/utils/setting';

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

      const user = raw?.user || raw?.data?.user || raw?.data?.userInfo || undefined;

      if (token) commonSettings.setStorage(ACCESS_TOKEN, token);
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string; // NVARCHAR(200) NOT NULL - max 200 chars
  email: string; // NVARCHAR(255) UNIQUE NOT NULL - max 255 chars
  phoneNumber: string; // NVARCHAR(30) - required by API
  gender: string; // NVARCHAR(20) - required by API
  birthYear: number; // INT - required by API
  password: string; // Will be hashed on backend
}

export interface AuthResponseUser {
  id: string | number;
  email: string;
  fullName?: string;
  role?: string;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthResponseUser;

  roles?: string[];

  message?: string;
  success?: boolean;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  confirmationCode: string;
}

export interface ResetPasswordRequest {
  email: string;
  confirmationCode: string;
  newPassword: string;
}



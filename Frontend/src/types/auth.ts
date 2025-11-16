export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string; // NVARCHAR(200) NOT NULL - max 200 chars
  email: string; // NVARCHAR(255) UNIQUE NOT NULL - max 255 chars
  phoneNumber?: string; // NVARCHAR(30) NULL - max 30 chars, optional
  gender?: string; // NVARCHAR(20) NULL - optional (Nam/Nữ/Khác)
  birthYear?: number; // INT NULL - optional (năm sinh)
  bloodType?: string; // Mapped to blood_type_id - format: "A+", "B-", etc.
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



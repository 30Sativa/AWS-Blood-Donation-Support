export interface UserProfile {
  userId: number;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  fullName: string;
  birthYear: number;
  gender: string;
  privacyPhoneVisibleToStaffOnly: boolean;
}

export interface UserProfileResponse {
  success: boolean;
  message: string | null;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  birthYear?: number;
  gender?: string;
  bloodType?: string;
  address?: string;
  privacyPhoneVisibleToStaffOnly?: boolean;
}

export interface ProfileError {
  message: string;
  errors?: Record<string, string[]>;
}

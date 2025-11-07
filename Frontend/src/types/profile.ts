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
  id?: number;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  birthYear?: number;
  gender?: string;
  roleCode?: string;
  isActive?: boolean;
}

export interface ProfileError {
  message: string;
  errors?: Record<string, string[]>;
}

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
  address?: string;
  bloodType?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string | null;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  id?: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  birthYear?: number;
  gender?: string;
  roleCode?: string;
  isActive?: boolean;
  address?: string;
  bloodType?: string;
  privacyPhoneVisibleToStaffOnly?: boolean;
}

export interface ProfileError {
  message: string;
  errors?: Record<string, string[]>;
}

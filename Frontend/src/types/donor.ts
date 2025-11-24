// src/types/donor.ts

export interface Availability {
  weekday: number; // 0-6 (Sunday-Saturday)
  timeFromMin: number; // Minutes from midnight (0-1440)
  timeToMin: number; // Minutes from midnight (0-1440)
}

export interface HealthConditionItem {
  conditionId: number;
  conditionName: string | null;
}

export interface Donor {
  donorId?: number; // API returns donorId
  id?: number; // Keep for backward compatibility
  userId: number;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  bloodTypeId?: number;
  bloodGroup?: string; // API returns bloodGroup (e.g., "O -")
  bloodType?: string; // For display (backward compatibility)
  addressId?: number;
  addressDisplay?: string; // API returns addressDisplay
  travelRadiusKm?: number; // API uses capital K
  travelRadiuskm?: number; // Keep for backward compatibility
  latitude?: number;
  longitude?: number;
  isReady: boolean;
  nextEligibleDate?: string | null; // ISO date string
  availabilities?: Availability[];
  healthConditions?: HealthConditionItem[]; // API returns array of {conditionId, conditionName}
  healthConditionIds?: number[]; // For backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterDonorRequest {
  userId: number;
  bloodTypeId: number;
  travelRadiusKm: number;
  fullAddress?: string;
  addressId?: number;
  isReady?: boolean;
  nextEligibleDate?: string;
  availabilities?: Availability[];
  healthConditionIds?: number[];
}

export interface UpdateDonorRequest {
  bloodTypeId?: number;
  addressId?: number;
  travelRadiusKm?: number;
  latitude?: number;
  longitude?: number;
  isReady?: boolean;
  nextEligibleDate?: string;
  availabilities?: Availability[];
  healthConditionIds?: number[];
}

export interface UpdateReadyStatusRequest {
  donorId: number;
  isReady: boolean;
}

export interface UpdateAvailabilityRequest {
  availabilities: Availability[];
}

export interface DonorResponse {
  success: boolean;
  message: string | null;
  data: Donor;
}

export interface BloodType {
  id: number;
  name: string;
  code: string; // e.g., "A+", "O-"
  description?: string;
}

export interface HealthCondition {
  id: number;
  name: string;
  description?: string;
}

export interface BloodTypesResponse {
  success: boolean;
  message: string | null;
  data: BloodType[];
}

export interface HealthConditionsResponse {
  success: boolean;
  message: string | null;
  data: HealthCondition[];
}


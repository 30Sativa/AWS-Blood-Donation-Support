// src/types/donor.ts

export interface Availability {
  weekday: number; // 0-6 (Sunday-Saturday)
  timeFromMin: number; // Minutes from midnight (0-1440)
  timeToMin: number; // Minutes from midnight (0-1440)
}

export interface Donor {
  id?: number;
  userId: number;
  bloodTypeId?: number;
  bloodType?: string; // For display
  addressId?: number;
  travelRadiusKm?: number;
  latitude?: number;
  longitude?: number;
  isReady: boolean;
  nextEligibleDate?: string; // ISO date string
  availabilities?: Availability[];
  healthConditionIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterDonorRequest {
  userId: number;
  bloodTypeId: number;
  addressId: number;
  travelRadiusKm?: number;
  latitude?: number;
  longitude?: number;
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
}

export interface HealthCondition {
  id: number;
  name: string;
  description?: string;
}


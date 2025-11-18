// src/types/donorSearch.ts

export interface DonorSearchRequest {
  bloodTypeCode: string;
  latitude: number;
  longitude: number;
  radiusKm?: number; // Default 50km
  requiredDate?: string; // ISO date string
  urgencyLevel?: 'critical' | 'urgent' | 'normal';
  limit?: number; // Max donors to return
}

export interface DonorSearchResult {
  donorId: number;
  userId: number;
  fullName: string;
  bloodType: string;
  phone?: string;
  email?: string;
  distanceKm: number;
  isReady: boolean;
  nextEligibleDate?: string;
  lastDonationDate?: string;
  totalDonations: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  matchScore: number; // 0-100, higher is better
}

export interface DonorSearchResponse {
  success: boolean;
  message: string | null;
  data: DonorSearchResult[];
  meta?: {
    totalFound: number;
    searchRadius: number;
    urgencyLevel: string;
  };
}

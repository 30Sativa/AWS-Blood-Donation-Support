// src/types/donation.ts

export interface Donation {
  id: number;
  donationCode: string;
  donorId: number;
  appointmentId?: number;
  donationDate: string; // ISO date string
  locationId: number;
  locationName?: string;
  donationType: 'whole_blood' | 'plasma' | 'platelet';
  bloodVolumeMl: number;
  bloodTypeId: number;
  bloodType?: string;
  status: 'Success' | 'Failed' | 'Deferred';
  testResults?: string; // JSON string
  notes?: string;
  recipientId?: number;
  livesSaved: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationStats {
  totalDonations: number;
  totalBloodDonated: number; // ml
  peopleSaved: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  donationsByType: {
    whole_blood: number;
    plasma: number;
    platelet: number;
  };
  donationsByYear: {
    year: number;
    count: number;
    volume: number;
  }[];
}

export interface CreateDonationRequest {
  donorId: number;
  appointmentId?: number;
  donationDate: string;
  locationId: number;
  donationType: 'whole_blood' | 'plasma' | 'platelet';
  bloodVolumeMl: number;
  bloodTypeId: number;
  status: 'Success' | 'Failed' | 'Deferred';
  testResults?: string;
  notes?: string;
  recipientId?: number;
}

export interface UpdateDonationRequest {
  status?: 'Success' | 'Failed' | 'Deferred';
  testResults?: string;
  notes?: string;
  recipientId?: number;
  livesSaved?: number;
}

export interface DonationResponse {
  success: boolean;
  message: string | null;
  data: Donation;
}

export interface DonationsResponse {
  success: boolean;
  message: string | null;
  data: Donation[];
}

export interface DonationStatsResponse {
  success: boolean;
  message: string | null;
  data: DonationStats;
}

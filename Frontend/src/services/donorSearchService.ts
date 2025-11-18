// src/services/donorSearchService.ts
import apiClient from "@/services/axios";
import type {
  DonorSearchRequest,
  DonorSearchResponse,
} from "@/types/donorSearch";

export const donorSearchService = {
  /**
   * Tìm kiếm donor phù hợp
   * POST /api/Donors/search
   */
  async searchDonors(
    request: DonorSearchRequest
  ): Promise<DonorSearchResponse> {
    try {
      const response = await apiClient.post<DonorSearchResponse>(
        "/api/Donors/search",
        request
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to search donors");
      }

      return response.data;
    } catch (error: any) {
      console.error("Search donors error:", error);
      throw error;
    }
  },

  /**
   * Client-side blood type compatibility check
   */
  getCompatibleBloodTypes(recipientBloodType: string): string[] {
    const compatibility: { [key: string]: string[] } = {
      "O-": ["O-"],
      "O+": ["O-", "O+"],
      "A-": ["O-", "A-"],
      "A+": ["O-", "O+", "A-", "A+"],
      "B-": ["O-", "B-"],
      "B+": ["O-", "O+", "B-", "B+"],
      "AB-": ["O-", "A-", "B-", "AB-"],
      "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    };

    return compatibility[recipientBloodType] || [];
  },

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
  },

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },
};

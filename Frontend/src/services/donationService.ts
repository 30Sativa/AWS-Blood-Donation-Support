// src/services/donationService.ts
import apiClient from "@/services/axios";
import type {
  Donation,
  DonationStats,
  CreateDonationRequest,
  UpdateDonationRequest,
  DonationResponse,
  DonationsResponse,
  DonationStatsResponse,
} from "@/types/donation";

export const donationService = {
  /**
   * Lấy lịch sử hiến máu của donor
   * GET /api/Donations/donor/{donorId}
   */
  async getDonationsByDonor(donorId: number): Promise<Donation[]> {
    try {
      const response = await apiClient.get<DonationsResponse>(
        `/api/Donations/donor/${donorId}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get donation history"
        );
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get donations by donor error:", error);
      // Return empty array if 404 (no donations yet)
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy thống kê hiến máu của donor
   * GET /api/Donations/donor/{donorId}/stats
   */
  async getDonorStats(donorId: number): Promise<DonationStats> {
    try {
      const response = await apiClient.get<DonationStatsResponse>(
        `/api/Donations/donor/${donorId}/stats`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get donation stats"
        );
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Get donor stats error:", error);
      // Return default stats if 404
      if (error.response?.status === 404) {
        return {
          totalDonations: 0,
          totalBloodDonated: 0,
          peopleSaved: 0,
          donationsByType: {
            whole_blood: 0,
            plasma: 0,
            platelet: 0,
          },
          donationsByYear: [],
        };
      }
      throw error;
    }
  },

  /**
   * Tạo bản ghi hiến máu mới
   * POST /api/Donations
   */
  async createDonation(
    data: CreateDonationRequest
  ): Promise<DonationResponse> {
    try {
      const response = await apiClient.post<DonationResponse>(
        "/api/Donations",
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create donation record"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Create donation error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một lần hiến máu
   * GET /api/Donations/{id}
   */
  async getDonationById(id: number): Promise<DonationResponse> {
    try {
      const response = await apiClient.get<DonationResponse>(
        `/api/Donations/${id}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get donation");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get donation by id error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin hiến máu
   * PUT /api/Donations/{id}
   */
  async updateDonation(
    id: number,
    data: UpdateDonationRequest
  ): Promise<DonationResponse> {
    try {
      const response = await apiClient.put<DonationResponse>(
        `/api/Donations/${id}`,
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update donation");
      }

      return response.data;
    } catch (error: any) {
      console.error("Update donation error:", error);
      throw error;
    }
  },
};

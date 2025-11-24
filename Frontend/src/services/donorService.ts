// src/services/donorService.ts
import apiClient from "@/services/axios";
import type {
  DonorResponse,
  RegisterDonorRequest,
  UpdateDonorRequest,
  UpdateReadyStatusRequest,
  UpdateAvailabilityRequest,
  Donor,
  BloodType,
  HealthCondition,
  BloodTypesResponse,
  HealthConditionsResponse,
} from "@/types/donor";

export const donorService = {
  /**
   * Đăng ký làm donor
   * POST /api/Donors/register
   */
  async registerDonor(data: RegisterDonorRequest): Promise<DonorResponse> {
    try {
      const response = await apiClient.post<DonorResponse>(
        "/api/Donors/register",
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to register donor");
      }

      return response.data;
    } catch (error: any) {
      console.error("Register donor error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin donor của user hiện tại
   * Sử dụng GET /api/Donors/me
   * Trả về null nếu user chưa đăng ký làm donor (404)
   */
  async getMyDonor(): Promise<DonorResponse | null> {
    try {
      const response = await apiClient.get<DonorResponse>("/api/Donors/me");

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get donor");
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Get my donor error:", error);
      return null;
    }
  },

  /**
   * Cập nhật thông tin donor của user hiện tại
   * PUT /api/Donors/me
   */
  async updateMyDonor(data: UpdateDonorRequest): Promise<DonorResponse> {
    try {
      const response = await apiClient.put<DonorResponse>(
        "/api/Donors/me",
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update donor");
      }

      return response.data;
    } catch (error: any) {
      console.error("Update my donor error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật ready status của donor
   * PUT /api/Donors/{id}/ready-status
   */
  async updateReadyStatus(
    donorId: number,
    data: UpdateReadyStatusRequest
  ): Promise<DonorResponse> {
    try {
      const response = await apiClient.put<DonorResponse>(
        `/api/Donors/${donorId}/ready-status`,
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update ready status"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Update ready status error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật availability của donor
   * PUT /api/Donors/{id}/availability
   */
  async updateAvailability(
    donorId: number,
    data: UpdateAvailabilityRequest
  ): Promise<DonorResponse> {
    try {
      const response = await apiClient.put<DonorResponse>(
        `/api/Donors/${donorId}/availability`,
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update availability"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Update availability error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin donor theo ID
   * GET /api/Donors/{id}
   */
  async getDonorById(id: number): Promise<DonorResponse> {
    try {
      const response = await apiClient.get<DonorResponse>(
        `/api/Donors/${id}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get donor");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get donor by id error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin donor theo userId
   * GET /api/Donors/user/{userId}
   */
  async getDonorByUserId(userId: number): Promise<DonorResponse | null> {
    try {
      const response = await apiClient.get<DonorResponse>(
        `/api/Donors/user/${userId}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get donor");
      }

      return response.data;
    } catch (error: any) {
      // Xử lý trường hợp 404 - user chưa đăng ký làm donor
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Get donor by user id error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách nhóm máu
   * GET /api/BloodTypes
   */
  async getBloodTypes(): Promise<BloodType[]> {
    try {
      const response = await apiClient.get<BloodTypesResponse>(
        "/api/BloodTypes"
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get blood types");
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get blood types error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tình trạng sức khỏe
   * GET /api/HealthConditions
   */
  async getHealthConditions(): Promise<HealthCondition[]> {
    try {
      const response = await apiClient.get<HealthConditionsResponse>(
        "/api/HealthConditions"
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get health conditions"
        );
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get health conditions error:", error);
      throw error;
    }
  },
};


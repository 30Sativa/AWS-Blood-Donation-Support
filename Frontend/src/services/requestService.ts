// src/services/requestService.ts
import apiClient from "@/services/axios";
import type {
  RegisterRequestRequest,
  RequestResponse,
  RequestsResponse,
  Request,
  UpdateRequestStatusRequest,
  CompatibleDonorsResponse,
  CompatibleDonor,
  CreateMatchRequest,
  MatchResponse,
} from "@/types/request";

export const requestService = {
  /**
   * Đăng ký blood request mới
   * POST /api/Requests/register
   */
  async registerRequest(data: RegisterRequestRequest): Promise<RequestResponse> {
    try {
      console.log(
        "[DEBUG] requestService.registerRequest - Payload:",
        JSON.stringify(data, null, 2)
      );
      const response = await apiClient.post<RequestResponse>(
        "/api/Requests/register",
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to register request");
      }

      return response.data;
    } catch (error: any) {
      console.error("Register request error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách blood requests của user hiện tại
   * GET /api/Requests/me
   */
  async getMyRequests(): Promise<Request[]> {
    try {
      const response = await apiClient.get<RequestsResponse>("/api/Requests/me");

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get my requests");
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get my requests error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin 1 blood request theo id
   * GET /api/Requests/{id}
   */
  async getRequest(id: number): Promise<Request> {
    try {
      const response = await apiClient.get<RequestResponse>(`/api/Requests/${id}`);

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get request");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Get request error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái blood request
   * PUT /api/Requests/{id}/status
   */
  async updateRequestStatus(
    id: number,
    data: UpdateRequestStatusRequest
  ): Promise<RequestResponse> {
    try {
      const response = await apiClient.put<RequestResponse>(
        `/api/Requests/${id}/status`,
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update request status"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Update request status error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách donor tương thích với request
   * GET /api/Requests/{id}/compatible-donors
   */
  async getCompatibleDonors(id: number): Promise<CompatibleDonor[]> {
    try {
      const response = await apiClient.get<CompatibleDonorsResponse>(
        `/api/Requests/${id}/compatible-donors`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get compatible donors"
        );
      }

      // Backend trả data = { requestedId, donors: [...] }
      return response.data.data?.donors || [];
    } catch (error: any) {
      console.error("Get compatible donors error:", error);
      throw error;
    }
  },

  /**
   * Tạo match giữa request và donor
   * POST /api/Requests/{id}/match
   */
  async createMatch(
    id: number,
    data: CreateMatchRequest
  ): Promise<MatchResponse> {
    try {
      const response = await apiClient.post<MatchResponse>(
        `/api/Requests/${id}/match`,
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create match");
      }

      return response.data;
    } catch (error: any) {
      console.error("Create match error:", error);
      throw error;
    }
  },
};



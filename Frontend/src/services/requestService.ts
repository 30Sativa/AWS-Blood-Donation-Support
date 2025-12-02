// src/services/requestService.ts
import apiClient from "@/services/axios";
import type {
  RegisterRequestRequest,
  RequestResponse,
  RequestsResponse,
  Request,
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
   * GET /api/Requests/my
   */
  async getMyRequests(): Promise<Request[]> {
    try {
      const response = await apiClient.get<RequestsResponse>("/api/Requests/my");

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
};


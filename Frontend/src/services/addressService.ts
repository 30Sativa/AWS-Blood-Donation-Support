import apiClient from "@/services/axios";
import type { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from "@/types/address";

export const addressService = {
  /**
   * Tạo địa chỉ mới
   * POST /api/Addresses
   */
  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    try {
      const response = await apiClient.post<AddressResponse>(
        "/api/Addresses",
        data
      );
      
      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create address");
      }

      return response.data;
    } catch (error: any) {
      console.error("Create address error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin địa chỉ theo ID
   * GET /api/Addresses/{id}
   */
  async getAddress(id: number): Promise<AddressResponse> {
    try {
      const response = await apiClient.get<AddressResponse>(
        `/api/Addresses/${id}`
      );
      
      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get address");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get address error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật địa chỉ
   * PUT /api/Addresses/{id}
   */
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const response = await apiClient.put<AddressResponse>(
        `/api/Addresses/${id}`,
        data
      );
      
      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update address");
      }

      return response.data;
    } catch (error: any) {
      console.error("Update address error:", error);
      throw error;
    }
  },
};


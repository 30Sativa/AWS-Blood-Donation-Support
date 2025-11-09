import apiClient from "@/services/axios";
import type { UserProfileResponse, UpdateProfileRequest } from "@/types/profile";

export const profileService = {
  /**
   * Lấy thông tin profile của user theo ID
   * GET /api/Users/{id}/profile
   */
  async getProfile(userId: number): Promise<UserProfileResponse> {
    try {
      // Axios tự động thêm token qua interceptor
      // Axios tự parse JSON và trả về response.data
      const response = await apiClient.get<UserProfileResponse>(
        `/api/Users/${userId}/profile`
      );
      
      // response.data đã là UserProfileResponse (có success, message, data)
      return response.data;
    } catch (error: any) {
      console.error("Get profile error:", error);
      // Axios interceptor đã throw Error với message từ backend
      throw error;
    }
  },

  /**
   * Cập nhật thông tin profile của user
   * PUT /api/Users/{id}
   */
  async updateProfile(
    userId: number,
    data: UpdateProfileRequest
  ): Promise<UserProfileResponse> {
    try {
      // Axios tự động thêm token qua interceptor
      // Axios tự parse JSON và trả về response.data
      const response = await apiClient.put<UserProfileResponse>(
        `/api/Users/${userId}`,
        data
      );
      
      // response.data đã là UserProfileResponse (có success, message, data)
      return response.data;
    } catch (error: any) {
      console.error("Update profile error:", error);
      // Axios interceptor đã throw Error với message từ backend
      throw error;
    }
  },
};

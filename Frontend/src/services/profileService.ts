import apiClient from "@/services/axios";
import type { UserProfileResponse, UpdateProfileRequest } from "@/types/profile";

export const profileService = {
  /**
   * Lấy thông tin profile của user hiện tại
   * GET /api/Users/me
   */
  async getCurrentUser(): Promise<UserProfileResponse> {
    try {
      // Axios tự động thêm token qua interceptor
      // Axios tự parse JSON và trả về response.data
      console.log("[DEBUG] Calling /api/Users/me endpoint (getCurrentUser)");
      const response = await apiClient.get<UserProfileResponse>(
        `/api/Users/me`
      );
      console.log("[DEBUG] Successfully received response from /api/Users/me");
      
      // Kiểm tra response structure
      if (!response.data) {
        throw new Error("Response data is empty");
      }

      // Nếu backend trả về error (success: false) nhưng status 200
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get user profile");
      }

      if (!response.data.data) {
        throw new Error("User profile data is missing");
      }
      
      // response.data đã là UserProfileResponse (có success, message, data)
      return response.data;
    } catch (error: any) {
      console.error("Get current user error:", error);
      // Axios interceptor đã throw Error với message từ backend
      throw error;
    }
  },

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

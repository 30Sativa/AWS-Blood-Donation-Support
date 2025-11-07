import type { UserProfileResponse, UpdateProfileRequest } from "@/types/profile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://13.239.7.174";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Đã xảy ra lỗi không xác định",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const profileService = {
  /**
   * Lấy thông tin profile của user theo ID
   * GET /api/Users/{id}/profile
   */
  async getProfile(userId: number): Promise<UserProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/${userId}/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      return await handleResponse<UserProfileResponse>(response);
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin user
   * PUT /api/Users/{id}
   */
  async updateProfile(
    userId: number,
    data: UpdateProfileRequest
  ): Promise<UserProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse<UserProfileResponse>(response);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },
};

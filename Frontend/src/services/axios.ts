import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://13.239.7.174";

// ============================================
// TYPES
// ============================================
export interface UserProfile {
  userId: number;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  fullName: string;
  birthYear: number;
  gender: string;
  privacyPhoneVisibleToStaffOnly: boolean;
}

export interface UserProfileResponse {
  success: boolean;
  message: string | null;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  birthYear?: number;
  gender?: string;
  bloodType?: string;
  address?: string;
  privacyPhoneVisibleToStaffOnly?: boolean;
}

// ============================================
// AXIOS INSTANCE
// ============================================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Đã xảy ra lỗi không xác định";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } else {
      throw new Error(error.message || "Đã xảy ra lỗi không xác định");
    }
  }
);

// ============================================
// MEMBER ROLE APIs
// ============================================

/**
 * Lấy thông tin profile của user theo ID
 * GET /api/Users/{id}/profile
 */
export const getMemberProfile = async (id: number): Promise<UserProfileResponse> => {
  try {
    const response = await apiClient.get<UserProfileResponse>(
      `/api/Users/${id}/profile`
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Đã xảy ra lỗi khi lấy thông tin profile");
  }
};

/**
 * Cập nhật thông tin profile của user
 * PUT /api/Users/{id}/profile
 */
export const updateMemberProfile = async (
  id: number,
  data: UpdateProfileRequest
): Promise<UserProfileResponse> => {
  try {
    const response = await apiClient.put<UserProfileResponse>(
      `/api/Users/${id}/profile`,
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Đã xảy ra lỗi khi cập nhật thông tin profile");
  }
};

// Export axios instance để có thể dùng ở nơi khác nếu cần
export default apiClient;


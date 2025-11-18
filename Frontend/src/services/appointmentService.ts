import apiClient from "@/services/axios";
import type {
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
} from "@/types/appointment";

interface AppointmentsResponse {
  success: boolean;
  message: string | null;
  data: Appointment[];
}

export const appointmentService = {
  /**
   * Tạo lịch hẹn hiến máu
   * POST /api/Appointments
   */
  async createAppointment(
    payload: AppointmentRequest
  ): Promise<AppointmentResponse> {
    try {
      const response = await apiClient.post<AppointmentResponse>(
        "/api/Appointments",
        payload
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create appointment"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Create appointment error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách lịch hẹn của donor
   * GET /api/Appointments/donor/{donorId}
   */
  async getAppointmentsByDonor(donorId: number): Promise<Appointment[]> {
    try {
      const response = await apiClient.get<AppointmentsResponse>(
        `/api/Appointments/donor/${donorId}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get appointments"
        );
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get appointments by donor error:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy chi tiết lịch hẹn
   * GET /api/Appointments/{id}
   */
  async getAppointmentById(id: number): Promise<AppointmentResponse> {
    try {
      const response = await apiClient.get<AppointmentResponse>(
        `/api/Appointments/${id}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get appointment");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get appointment by id error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái lịch hẹn
   * PUT /api/Appointments/{id}/status
   */
  async updateAppointmentStatus(
    id: number,
    status: string
  ): Promise<AppointmentResponse> {
    try {
      const response = await apiClient.put<AppointmentResponse>(
        `/api/Appointments/${id}/status`,
        { status }
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update appointment status"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Update appointment status error:", error);
      throw error;
    }
  },

  /**
   * Hủy lịch hẹn
   * DELETE /api/Appointments/{id}
   */
  async cancelAppointment(id: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/Appointments/${id}`);

      if (response.data && !response.data.success) {
        throw new Error(
          response.data.message || "Failed to cancel appointment"
        );
      }
    } catch (error: any) {
      console.error("Cancel appointment error:", error);
      throw error;
    }
  },
};


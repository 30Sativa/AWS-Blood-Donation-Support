// src/services/notificationService.ts
import apiClient from "@/services/axios";
import type {
  Notification,
  CreateNotificationRequest,
  NotificationResponse,
  NotificationsResponse,
  NotificationStats,
  NotificationStatsResponse,
} from "@/types/notification";

export const notificationService = {
  /**
   * Lấy danh sách thông báo của donor
   * GET /api/Notifications/donor/{donorId}
   */
  async getNotificationsByDonor(donorId: number): Promise<Notification[]> {
    try {
      const response = await apiClient.get<NotificationsResponse>(
        `/api/Notifications/donor/${donorId}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get notifications"
        );
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get notifications by donor error:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy danh sách thông báo của user
   * GET /api/Notifications/user/{userId}
   */
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    try {
      const response = await apiClient.get<NotificationsResponse>(
        `/api/Notifications/user/${userId}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get notifications"
        );
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get notifications by user error:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Lấy thống kê thông báo
   * GET /api/Notifications/stats
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<NotificationStatsResponse>(
        "/api/Notifications/stats"
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get notification stats"
        );
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Get notification stats error:", error);
      return {
        total: 0,
        unread: 0,
        byType: {},
      };
    }
  },

  /**
   * Gửi thông báo
   * POST /api/Notifications/send
   */
  async sendNotification(
    data: CreateNotificationRequest
  ): Promise<NotificationResponse> {
    try {
      const response = await apiClient.post<NotificationResponse>(
        "/api/Notifications/send",
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to send notification"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Send notification error:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu thông báo đã đọc
   * PUT /api/Notifications/{id}/read
   */
  async markAsRead(id: number): Promise<NotificationResponse> {
    try {
      const response = await apiClient.put<NotificationResponse>(
        `/api/Notifications/${id}/read`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to mark notification as read"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Mark notification as read error:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * PUT /api/Notifications/read-all
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
      }>("/api/Notifications/read-all");

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to mark all as read"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Mark all as read error:", error);
      throw error;
    }
  },

  /**
   * Xóa thông báo
   * DELETE /api/Notifications/{id}
   */
  async deleteNotification(id: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/Notifications/${id}`);

      if (response.data && !response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete notification"
        );
      }
    } catch (error: any) {
      console.error("Delete notification error:", error);
      throw error;
    }
  },
};

// src/types/notification.ts

export interface Notification {
  id: number;
  userId: number;
  donorId?: number;
  type: 'reminder' | 'urgent_request' | 'appointment_confirm' | 'appointment_reminder' | 'eligibility_update' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  relatedId?: number; // AppointmentId hoặc RequestId
  createdAt: string;
}

export interface CreateNotificationRequest {
  userId: number;
  donorId?: number;
  type: 'reminder' | 'urgent_request' | 'appointment_confirm' | 'appointment_reminder' | 'eligibility_update' | 'general';
  title: string;
  message: string;
  relatedId?: number;
}

export interface NotificationResponse {
  success: boolean;
  message: string | null;
  data: Notification;
}

export interface NotificationsResponse {
  success: boolean;
  message: string | null;
  data: Notification[];
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [key: string]: number;
  };
}

export interface NotificationStatsResponse {
  success: boolean;
  message: string | null;
  data: NotificationStats;
}

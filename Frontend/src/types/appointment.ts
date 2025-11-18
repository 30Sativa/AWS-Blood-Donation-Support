export interface AppointmentRequest {
  requestId: number;
  donorId: number;
  scheduledAt: string; // ISO date string
  locationId: number;
  status: string;
}

export interface Appointment {
  id: number;
  requestId: number;
  donorId: number;
  scheduledAt: string;
  locationId: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentResponse {
  success: boolean;
  message: string | null;
  data: Appointment;
}


// src/types/request.ts

export type RequestStatus = "REQUESTED" | "MATCHING" | "FULFILLED" | "CANCELLED";

export type RequestUrgency = "LOW" | "NORMAL" | "HIGH" | "Low" | "Normal" | "High";

export interface RegisterRequestRequest {
  requesterUserId: number;
  urgency: RequestUrgency; // "LOW" | "NORMAL" | "HIGH"
  bloodTypeId: number;
  componentId: number;
  quantityUnits: number;
  needBeforeUtc: string; // ISO 8601 format
  clinicalNotes: string;
  // Địa chỉ giao nhận dạng text (backend hiện hỗ trợ Option B - deliveryAddress)
  deliveryAddress: string; // fullAddress string
}

export interface Request {
  requestId: number;
  requesterUserId: number;
  urgency: RequestUrgency;
  bloodTypeId: number;
  componentId: number;
  quantityUnits: number;
  needBeforeUtc: string;
  // Backend hiện trả về deliveryAddressId; giữ thêm deliveryAddress để tương thích UI cũ
  deliveryAddressId?: number;
  deliveryAddress?: string;
  clinicalNotes: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface RequestResponse {
  success: boolean;
  message?: string;
  data?: Request;
}

export interface RequestsResponse {
  success: boolean;
  message?: string | null;
  data?: Request[];
}

export interface UpdateRequestStatusRequest {
  status: RequestStatus;
}

export interface CompatibleDonor {
  donorId: number;
  fullName: string;
  bloodGroup: string;
  phoneNumber?: string;
  email?: string;
  distanceKm?: number;
  availability?: string;
}

export interface CompatibleDonorsResponse {
  success: boolean;
  message?: string | null;
  // Backend: data = { requestedId: number, donors: CompatibleDonor[] }
  data?: {
    requestedId: number;
    donors: CompatibleDonor[];
  };
}

export interface CreateMatchRequest {
  donorId: number;
}

export interface MatchResponse {
  success: boolean;
  message?: string | null;
}


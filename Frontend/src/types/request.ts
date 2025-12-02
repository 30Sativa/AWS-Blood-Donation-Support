// src/types/request.ts

export interface RegisterRequestRequest {
  requesterUserId: number;
  urgency: string; // "LOW" | "NORMAL" | "HIGH"
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
  urgency: string;
  bloodTypeId: number;
  componentId: number;
  quantityUnits: number;
  needBeforeUtc: string;
  deliveryAddress: string;
  clinicalNotes: string;
  status: string;
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


// src/types/request.ts

export interface RegisterRequestRequest {
  requesterUserId: number;
  urgency: string; // "LOW" | "NORMAL" | "HIGH"
  bloodTypeId: number;
  componentId: number;
  quantityUnits: number;
  needBeforeUtc: string; // ISO 8601 format
  deliveryAddressId: number;
  clinicalNotes: string;
  // Optional: có thể nhập address trực tiếp nếu deliveryAddressId = 0
  deliveryAddress?: string; // fullAddress string
}

export interface Request {
  requestId: number;
  requesterUserId: number;
  urgency: string;
  bloodTypeId: number;
  componentId: number;
  quantityUnits: number;
  needBeforeUtc: string;
  deliveryAddressId: number;
  clinicalNotes: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestResponse {
  success: boolean;
  message?: string;
  data?: Request;
}


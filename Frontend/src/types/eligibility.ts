// src/types/eligibility.ts

export interface EligibilityCheck {
  id: number;
  donorId: number;
  checkDate: string; // ISO date string
  weight?: number; // kg
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  hemoglobin?: number; // g/dL
  temperature?: number; // Celsius
  heartRate?: number; // bpm
  isEligible: boolean;
  reason?: string;
  checkedBy?: number; // userId
  createdAt?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  nextEligibleDate?: string;
  daysUntilEligible?: number;
  checks: {
    ageCheck: { passed: boolean; message: string };
    weightCheck: { passed: boolean; message: string };
    bloodPressureCheck: { passed: boolean; message: string };
    hemoglobinCheck: { passed: boolean; message: string };
    temperatureCheck: { passed: boolean; message: string };
    heartRateCheck: { passed: boolean; message: string };
    recoveryTimeCheck: { passed: boolean; message: string };
    healthConditionCheck: { passed: boolean; message: string };
  };
}

export interface CreateEligibilityCheckRequest {
  donorId: number;
  weight?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  hemoglobin?: number;
  temperature?: number;
  heartRate?: number;
  checkedBy?: number;
}

export interface EligibilityCheckResponse {
  success: boolean;
  message: string | null;
  data: EligibilityCheck;
}

export interface EligibilityResultResponse {
  success: boolean;
  message: string | null;
  data: EligibilityResult;
}

export interface EligibilityChecksResponse {
  success: boolean;
  message: string | null;
  data: EligibilityCheck[];
}

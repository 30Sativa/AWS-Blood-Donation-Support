// src/services/eligibilityService.ts
import apiClient from "@/services/axios";
import type {
  EligibilityCheck,
  EligibilityResult,
  CreateEligibilityCheckRequest,
  EligibilityCheckResponse,
  EligibilityResultResponse,
  EligibilityChecksResponse,
} from "@/types/eligibility";

export const eligibilityService = {
  /**
   * Kiểm tra điều kiện hiến máu của donor
   * GET /api/Donors/{donorId}/eligibility
   */
  async checkEligibility(donorId: number): Promise<EligibilityResult> {
    try {
      const response = await apiClient.get<EligibilityResultResponse>(
        `/api/Donors/${donorId}/eligibility`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to check eligibility"
        );
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Check eligibility error:", error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử kiểm tra điều kiện
   * GET /api/EligibilityChecks/donor/{donorId}
   */
  async getEligibilityChecksByDonor(
    donorId: number
  ): Promise<EligibilityCheck[]> {
    try {
      const response = await apiClient.get<EligibilityChecksResponse>(
        `/api/EligibilityChecks/donor/${donorId}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get eligibility checks"
        );
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error("Get eligibility checks error:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Tạo bản ghi kiểm tra điều kiện
   * POST /api/EligibilityChecks
   */
  async createEligibilityCheck(
    data: CreateEligibilityCheckRequest
  ): Promise<EligibilityCheckResponse> {
    try {
      const response = await apiClient.post<EligibilityCheckResponse>(
        "/api/EligibilityChecks",
        data
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create eligibility check"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Create eligibility check error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết kiểm tra điều kiện
   * GET /api/EligibilityChecks/{id}
   */
  async getEligibilityCheckById(
    id: number
  ): Promise<EligibilityCheckResponse> {
    try {
      const response = await apiClient.get<EligibilityCheckResponse>(
        `/api/EligibilityChecks/${id}`
      );

      if (!response.data) {
        throw new Error("Response data is empty");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to get eligibility check"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Get eligibility check error:", error);
      throw error;
    }
  },

  /**
   * Client-side eligibility check (không cần API)
   * Kiểm tra nhanh điều kiện cơ bản
   */
  checkEligibilityLocal(params: {
    age?: number;
    weight?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    hemoglobin?: number;
    temperature?: number;
    heartRate?: number;
    gender?: string;
    lastDonationDate?: string;
    healthConditions?: string[];
  }): EligibilityResult {
    const reasons: string[] = [];
    const checks = {
      ageCheck: { passed: true, message: "Age is within acceptable range" },
      weightCheck: { passed: true, message: "Weight is sufficient" },
      bloodPressureCheck: {
        passed: true,
        message: "Blood pressure is normal",
      },
      hemoglobinCheck: { passed: true, message: "Hemoglobin level is good" },
      temperatureCheck: { passed: true, message: "Temperature is normal" },
      heartRateCheck: { passed: true, message: "Heart rate is normal" },
      recoveryTimeCheck: {
        passed: true,
        message: "Recovery time has passed",
      },
      healthConditionCheck: {
        passed: true,
        message: "No disqualifying conditions",
      },
    };

    // Age check (18-60)
    if (params.age !== undefined) {
      if (params.age < 18 || params.age > 60) {
        checks.ageCheck.passed = false;
        checks.ageCheck.message = "Age must be between 18-60 years";
        reasons.push("Tuổi không phù hợp (18-60 tuổi)");
      }
    }

    // Weight check (≥ 45kg)
    if (params.weight !== undefined) {
      if (params.weight < 45) {
        checks.weightCheck.passed = false;
        checks.weightCheck.message = "Weight must be at least 45kg";
        reasons.push("Cân nặng phải ≥ 45kg");
      }
    }

    // Blood pressure check (90-140 / 60-90)
    if (
      params.bloodPressureSystolic !== undefined &&
      params.bloodPressureDiastolic !== undefined
    ) {
      if (
        params.bloodPressureSystolic < 90 ||
        params.bloodPressureSystolic > 140 ||
        params.bloodPressureDiastolic < 60 ||
        params.bloodPressureDiastolic > 90
      ) {
        checks.bloodPressureCheck.passed = false;
        checks.bloodPressureCheck.message =
          "Blood pressure must be 90-140 / 60-90 mmHg";
        reasons.push("Huyết áp không ổn định");
      }
    }

    // Hemoglobin check
    if (params.hemoglobin !== undefined && params.gender) {
      const minHemoglobin = params.gender === "Male" ? 12.5 : 12.0;
      if (params.hemoglobin < minHemoglobin) {
        checks.hemoglobinCheck.passed = false;
        checks.hemoglobinCheck.message = `Hemoglobin must be ≥ ${minHemoglobin} g/dL`;
        reasons.push(`Hemoglobin thấp (cần ≥ ${minHemoglobin} g/dL)`);
      }
    }

    // Temperature check (< 37.5°C)
    if (params.temperature !== undefined) {
      if (params.temperature >= 37.5) {
        checks.temperatureCheck.passed = false;
        checks.temperatureCheck.message = "Temperature must be < 37.5°C";
        reasons.push("Nhiệt độ cơ thể cao");
      }
    }

    // Heart rate check (60-100 bpm)
    if (params.heartRate !== undefined) {
      if (params.heartRate < 60 || params.heartRate > 100) {
        checks.heartRateCheck.passed = false;
        checks.heartRateCheck.message = "Heart rate must be 60-100 bpm";
        reasons.push("Nhịp tim không ổn định");
      }
    }

    // Recovery time check (12 weeks for whole blood)
    if (params.lastDonationDate) {
      const lastDate = new Date(params.lastDonationDate);
      const now = new Date();
      const daysSinceLastDonation = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastDonation < 84) {
        checks.recoveryTimeCheck.passed = false;
        const daysRemaining = 84 - daysSinceLastDonation;
        checks.recoveryTimeCheck.message = `Must wait ${daysRemaining} more days`;
        reasons.push(
          `Chưa đủ thời gian phục hồi (còn ${daysRemaining} ngày)`
        );
      }
    }

    // Health conditions check
    const disqualifyingConditions = [
      "HIV/AIDS",
      "Hepatitis B",
      "Hepatitis C",
      "Heart disease",
      "Cancer",
    ];

    if (params.healthConditions && params.healthConditions.length > 0) {
      const hasDisqualifying = params.healthConditions.some((condition) =>
        disqualifyingConditions.some((dc) =>
          condition.toLowerCase().includes(dc.toLowerCase())
        )
      );

      if (hasDisqualifying) {
        checks.healthConditionCheck.passed = false;
        checks.healthConditionCheck.message =
          "Has disqualifying health conditions";
        reasons.push("Có tình trạng sức khỏe không phù hợp");
      }
    }

    const isEligible = Object.values(checks).every((check) => check.passed);

    // Calculate next eligible date if not eligible due to recovery time
    let nextEligibleDate: string | undefined;
    let daysUntilEligible: number | undefined;

    if (!checks.recoveryTimeCheck.passed && params.lastDonationDate) {
      const lastDate = new Date(params.lastDonationDate);
      const nextDate = new Date(lastDate.getTime() + 84 * 24 * 60 * 60 * 1000);
      nextEligibleDate = nextDate.toISOString();

      const now = new Date();
      daysUntilEligible = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      isEligible,
      reasons: isEligible ? [] : reasons,
      nextEligibleDate,
      daysUntilEligible,
      checks,
    };
  },
};

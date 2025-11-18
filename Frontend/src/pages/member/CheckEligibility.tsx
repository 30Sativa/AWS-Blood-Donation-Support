// src/pages/member/CheckEligibility.tsx
import { EligibilityChecker } from "@/components/ui/EligibilityChecker";

export function CheckEligibility() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Check Eligibility</h1>
        <p className="text-gray-600 mt-1">
          Kiểm tra nhanh xem bạn có đủ điều kiện hiến máu không
        </p>
      </div>

      <EligibilityChecker />
    </div>
  );
}

// src/components/ui/EligibilityChecker.tsx
import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { eligibilityService } from "@/services/eligibilityService";
import type { EligibilityResult } from "@/types/eligibility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function EligibilityChecker() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    gender: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    hemoglobin: "",
    temperature: "",
    heartRate: "",
    lastDonationDate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (result) setResult(null);
  };

  const handleCheck = () => {
    setChecking(true);

    // Simulate checking delay
    setTimeout(() => {
      const eligibility = eligibilityService.checkEligibilityLocal({
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        gender: formData.gender || undefined,
        bloodPressureSystolic: formData.bloodPressureSystolic
          ? Number(formData.bloodPressureSystolic)
          : undefined,
        bloodPressureDiastolic: formData.bloodPressureDiastolic
          ? Number(formData.bloodPressureDiastolic)
          : undefined,
        hemoglobin: formData.hemoglobin ? Number(formData.hemoglobin) : undefined,
        temperature: formData.temperature ? Number(formData.temperature) : undefined,
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        lastDonationDate: formData.lastDonationDate || undefined,
      });

      setResult(eligibility);
      setChecking(false);
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      age: "",
      weight: "",
      gender: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      hemoglobin: "",
      temperature: "",
      heartRate: "",
      lastDonationDate: "",
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Công cụ kiểm tra nhanh
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Đây là công cụ kiểm tra sơ bộ. Kết quả chính thức sẽ được xác định tại
              điểm hiến máu.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nhập thông tin của bạn
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Tuổi</Label>
            <Input
              id="age"
              type="number"
              placeholder="Ví dụ: 25"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Cân nặng (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ví dụ: 55"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastDonationDate">Lần hiến gần nhất</Label>
            <Input
              id="lastDonationDate"
              type="date"
              value={formData.lastDonationDate}
              onChange={(e) => handleInputChange("lastDonationDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodPressureSystolic">Huyết áp tâm thu (mmHg)</Label>
            <Input
              id="bloodPressureSystolic"
              type="number"
              placeholder="Ví dụ: 120"
              value={formData.bloodPressureSystolic}
              onChange={(e) =>
                handleInputChange("bloodPressureSystolic", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodPressureDiastolic">Huyết áp tâm trương (mmHg)</Label>
            <Input
              id="bloodPressureDiastolic"
              type="number"
              placeholder="Ví dụ: 80"
              value={formData.bloodPressureDiastolic}
              onChange={(e) =>
                handleInputChange("bloodPressureDiastolic", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
            <Input
              id="hemoglobin"
              type="number"
              step="0.1"
              placeholder="Ví dụ: 13.5"
              value={formData.hemoglobin}
              onChange={(e) => handleInputChange("hemoglobin", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Nhiệt độ (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="Ví dụ: 36.5"
              value={formData.temperature}
              onChange={(e) => handleInputChange("temperature", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heartRate">Nhịp tim (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="Ví dụ: 75"
              value={formData.heartRate}
              onChange={(e) => handleInputChange("heartRate", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleCheck}
            disabled={checking}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {checking ? "Đang kiểm tra..." : "Kiểm tra điều kiện"}
          </Button>
          <Button onClick={handleReset} variant="outline">
            Làm mới
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg border-2 p-6 ${
            result.isEligible
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-4">
            {result.isEligible ? (
              <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3
                className={`text-2xl font-bold mb-2 ${
                  result.isEligible ? "text-green-700" : "text-red-700"
                }`}
              >
                {result.isEligible ? "Đủ điều kiện!" : "Chưa đủ điều kiện"}
              </h3>
              <p
                className={`text-sm mb-4 ${
                  result.isEligible ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.isEligible
                  ? "Bạn có thể hiến máu ngay bây giờ. Hãy đặt lịch hẹn!"
                  : "Bạn chưa đủ điều kiện hiến máu. Vui lòng xem chi tiết bên dưới."}
              </p>

              {!result.isEligible && result.reasons.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Lý do:
                  </p>
                  <ul className="space-y-1">
                    {result.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.nextEligibleDate && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Ngày có thể hiến tiếp theo:
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(result.nextEligibleDate).toLocaleDateString("vi-VN")}
                    {result.daysUntilEligible && (
                      <span className="text-gray-500">
                        {" "}
                        (còn {result.daysUntilEligible} ngày)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(result.checks).map(([key, check]) => (
              <div
                key={key}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  check.passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {check.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

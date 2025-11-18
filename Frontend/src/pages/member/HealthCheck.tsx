import { useState, useEffect } from "react";
import { Heart, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { eligibilityService } from "@/services/eligibilityService";
import { donorService } from "@/services/donorService";
import { profileService } from "@/services/profileService";
import type { EligibilityCheck, EligibilityResult } from "@/types/eligibility";

export function HealthCheck() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [healthChecks, setHealthChecks] = useState<EligibilityCheck[]>([]);

  useEffect(() => {
    loadEligibilityData();
  }, []);

  const loadEligibilityData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get current user profile
      const profileResponse = await profileService.getCurrentUser();
      if (!profileResponse.success || !profileResponse.data) {
        throw new Error("Failed to get user profile");
      }

      const userId = profileResponse.data.userId;

      // Get donor info
      const donorResponse = await donorService.getDonorByUserId(userId);
      if (!donorResponse || !donorResponse.data) {
        setError("Bạn chưa đăng ký làm donor. Vui lòng đăng ký trước.");
        return;
      }

      const donorId = donorResponse.data.id;
      if (!donorId) {
        throw new Error("Donor ID not found");
      }

      // Load eligibility and history
      const [eligibility, checks] = await Promise.all([
        eligibilityService.checkEligibility(donorId).catch(() => null),
        eligibilityService.getEligibilityChecksByDonor(donorId).catch(() => []),
      ]);

      setEligibilityResult(eligibility);
      setHealthChecks(checks);
    } catch (err: any) {
      console.error("Load eligibility data error:", err);
      setError(
        err.message || "Không thể tải dữ liệu kiểm tra sức khỏe. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang kiểm tra điều kiện...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-black">Health Check</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Không thể tải dữ liệu</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Health Check</h1>
        <p className="text-gray-600 mt-1">Check your eligibility for blood donation</p>
      </div>

      {/* Current Status and Eligibility Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <div
          className={`${
            eligibilityResult?.isEligible
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } border-2 rounded-lg p-6`}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Status</h2>
          <div className="flex flex-col items-center justify-center py-8">
            {eligibilityResult?.isEligible ? (
              <>
                <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                <div className="text-3xl font-bold text-green-600 mb-2">Eligible</div>
                <p className="text-sm text-gray-700 text-center mt-2">
                  Bạn đủ điều kiện hiến máu ngay bây giờ!
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mb-4" />
                <div className="text-3xl font-bold text-red-600 mb-2">Not Eligible</div>
                <p className="text-sm text-gray-700 text-center mt-2">
                  {eligibilityResult?.daysUntilEligible
                    ? `Còn ${eligibilityResult.daysUntilEligible} ngày nữa mới có thể hiến máu`
                    : "Bạn chưa đủ điều kiện hiến máu"}
                </p>
                {eligibilityResult?.reasons && eligibilityResult.reasons.length > 0 && (
                  <div className="mt-4 w-full">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Lý do:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {eligibilityResult.reasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Eligibility Notes Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Blood Donation Eligibility Notes
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Blood Pressure:
              </p>
              <p className="text-sm text-gray-600">90-140 / 60-90 mmHg</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Weight:
              </p>
              <p className="text-sm text-gray-600">≥ 45 kg</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Hemoglobin:
              </p>
              <p className="text-sm text-gray-600">
                Male ≥ 12.5 g/dL, Female ≥ 12.0 g/dL
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Age:
              </p>
              <p className="text-sm text-gray-600">18-60 years</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Recovery Time:
              </p>
              <p className="text-sm text-gray-600">12 weeks between donations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Checks */}
      {eligibilityResult?.checks && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Checks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(eligibilityResult.checks).map(([key, check]) => (
              <div
                key={key}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  check.passed ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {check.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Check History */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Health Check History</h2>
          <p className="text-gray-600 mt-1">Your past health check records</p>
        </div>

        {healthChecks.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Chưa có lịch sử kiểm tra</p>
            <p className="text-gray-500 text-sm mt-2">
              Lịch sử kiểm tra sức khỏe sẽ được ghi nhận khi bạn đến hiến máu
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Weight (kg)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Blood Pressure
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Hemoglobin
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {healthChecks.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(record.checkDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.weight || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.bloodPressureSystolic && record.bloodPressureDiastolic
                          ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.hemoglobin ? `${record.hemoglobin} g/dL` : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            record.isEligible
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.isEligible ? "Eligible" : "Deferred"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// src/components/ui/DonationStatistics.tsx
import { useState, useEffect } from "react";
import { Heart, Droplet, Award, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { donationService } from "@/services/donationService";
import type { DonationStats } from "@/types/donation";

interface DonationStatisticsProps {
  donorId: number;
}

export function DonationStatistics({ donorId }: DonationStatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DonationStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [donorId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const statsData = await donationService.getDonorStats(donorId);
      setStats(statsData);
    } catch (err: any) {
      console.error("Load stats error:", err);
      setError("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-sm text-red-600">{error || "Không có dữ liệu"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <Heart className="w-8 h-8 text-red-600 mb-3" />
          <div className="text-3xl font-bold text-red-700 mb-1">
            {stats.totalDonations}
          </div>
          <p className="text-sm text-red-600 font-medium">Lần hiến máu</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <Droplet className="w-8 h-8 text-blue-600 mb-3" />
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {stats.totalBloodDonated.toLocaleString()}
          </div>
          <p className="text-sm text-blue-600 font-medium">ml máu</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <Award className="w-8 h-8 text-green-600 mb-3" />
          <div className="text-3xl font-bold text-green-700 mb-1">
            {stats.peopleSaved}
          </div>
          <p className="text-sm text-green-600 font-medium">Người được cứu</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <div className="text-3xl font-bold text-purple-700 mb-1">
            {stats.donationsByYear.length > 0
              ? stats.donationsByYear[stats.donationsByYear.length - 1].count
              : 0}
          </div>
          <p className="text-sm text-purple-600 font-medium">Lần năm nay</p>
        </div>
      </div>

      {/* Donation by Type */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phân loại hiến máu
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Máu toàn phần</span>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalDonations > 0
                        ? (stats.donationsByType.whole_blood / stats.totalDonations) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                {stats.donationsByType.whole_blood}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Huyết tương</span>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalDonations > 0
                        ? (stats.donationsByType.plasma / stats.totalDonations) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                {stats.donationsByType.plasma}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tiểu cầu</span>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalDonations > 0
                        ? (stats.donationsByType.platelet / stats.totalDonations) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                {stats.donationsByType.platelet}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Donation by Year */}
      {stats.donationsByYear.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch sử theo năm
          </h3>
          <div className="space-y-3">
            {stats.donationsByYear.map((yearData) => (
              <div key={yearData.year} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Năm {yearData.year}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {yearData.count} lần • {yearData.volume.toLocaleString()}ml
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.totalDonations > 0
                            ? (yearData.count / stats.totalDonations) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

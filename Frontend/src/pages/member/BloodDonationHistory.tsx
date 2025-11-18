import { useState, useEffect } from "react";
import { Heart, Droplet, Award, Calendar, Loader2, AlertCircle } from "lucide-react";
import { donationService } from "@/services/donationService";
import { donorService } from "@/services/donorService";
import { profileService } from "@/services/profileService";
import type { Donation, DonationStats } from "@/types/donation";

export function BloodDonationHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    totalBloodDonated: 0,
    peopleSaved: 0,
    donationsByType: {
      whole_blood: 0,
      plasma: 0,
      platelet: 0,
    },
    donationsByYear: [],
  });

  useEffect(() => {
    loadDonationHistory();
  }, []);

  const loadDonationHistory = async () => {
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

      // Load donations and stats
      const [donationsData, statsData] = await Promise.all([
        donationService.getDonationsByDonor(donorId),
        donationService.getDonorStats(donorId),
      ]);

      setDonations(donationsData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Load donation history error:", err);
      setError(
        err.message || "Không thể tải lịch sử hiến máu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatNextDonation = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang tải lịch sử hiến máu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-black">Blood donation history</h1>
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
      {/* Blood donation history section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Blood donation history</h1>
          <p className="text-gray-600 mt-1">Review your blood donations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Donations Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Heart className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.totalDonations}
            </div>
            <p className="text-sm text-gray-600">total number of times</p>
          </div>

          {/* Total Blood Donated Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Droplet className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.totalBloodDonated.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">ml blood</p>
          </div>

          {/* People Saved Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Award className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.peopleSaved}
            </div>
            <p className="text-sm text-gray-600">total people saved</p>
          </div>

          {/* Next Donation Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Calendar className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {formatNextDonation(stats.nextEligibleDate)}
            </div>
            <p className="text-sm text-gray-600">next time</p>
          </div>
        </div>
      </div>

      {/* Historical details section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Historical details</h2>
          <p className="text-gray-600 mt-1">List of completed blood donations</p>
        </div>

        {donations.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Chưa có lịch sử hiến máu</p>
            <p className="text-gray-500 text-sm mt-2">
              Hãy đăng ký lịch hiến máu để bắt đầu hành trình cứu người!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Donation day
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Blood volume
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {donation.donationCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(donation.donationDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {donation.locationName || `Location #${donation.locationId}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {donation.donationType === "whole_blood"
                          ? "Whole Blood"
                          : donation.donationType === "plasma"
                          ? "Plasma"
                          : "Platelet"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {donation.bloodVolumeMl}ml
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            donation.status === "Success"
                              ? "bg-green-100 text-green-800"
                              : donation.status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {donation.status}
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


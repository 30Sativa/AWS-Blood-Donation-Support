import { useState, useEffect } from "react";
import { DonorManagement } from "@/components/ui/DonorManagement";
import { profileService } from "@/services/profileService";

export function DonorProfile() {
  const [userId, setUserId] = useState<number | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await profileService.getCurrentUser();
        if (response.success && response.data) {
          const profile = response.data;
          setUserId(profile.userId);
          setAddressId(profile.addressId || null);
        } else {
          setError(response.message || "Không thể tải thông tin người dùng.");
        }
      } catch (err) {
        console.error("Error loading profile in DonorProfile:", err);
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-600">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="py-12 text-center text-gray-600">
        Vui lòng đăng nhập để quản lý hồ sơ donor.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Donor Profile</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin hiến máu của bạn, trạng thái sẵn sàng và bán kính di chuyển.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <DonorManagement
          userId={userId}
          addressId={addressId}
          onAddressChange={(newAddressId) => setAddressId(newAddressId)}
        />
      </div>
    </div>
  );
}


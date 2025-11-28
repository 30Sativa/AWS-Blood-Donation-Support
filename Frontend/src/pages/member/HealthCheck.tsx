import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, MapPin, Radar, RefreshCw } from "lucide-react";
import { donorService } from "@/services/donorService";
import type { Donor } from "@/types/donor";

interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string | null;
}

export function NearbyDonorsPage() {
  const [initializing, setInitializing] = useState(true);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [error, setError] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (!currentLocation) return;
    fetchNearbyDonors(radiusKm);
  }, [currentLocation, radiusKm]);

  const initializeLocation = async () => {
    try {
      setInitializing(true);
      setError("");
      const donorResponse = await donorService.getMyDonor();

      if (!donorResponse || !donorResponse.data) {
        setError("Bạn chưa đăng ký làm donor. Vui lòng đăng ký để sử dụng tính năng này.");
        setCurrentLocation(null);
        return;
      }

      const donorData = donorResponse.data;
      if (
        donorData.latitude === undefined ||
        donorData.latitude === null ||
        donorData.longitude === undefined ||
        donorData.longitude === null
      ) {
        setError("Tài khoản của bạn chưa có thông tin tọa độ. Vui lòng cập nhật địa chỉ.");
        setCurrentLocation(null);
        return;
      }

      setCurrentLocation({
        latitude: donorData.latitude,
        longitude: donorData.longitude,
        address: donorData.addressDisplay || null,
      });
    } catch (err: any) {
      console.error("initializeLocation error:", err);
      setError(err?.message || "Không thể xác định vị trí hiện tại của bạn.");
      setCurrentLocation(null);
    } finally {
      setInitializing(false);
    }
  };

  const fetchNearbyDonors = async (radius: number) => {
    if (!currentLocation) return;
    try {
      setLoadingDonors(true);
      setError("");
      const data = await donorService.getNearbyDonors({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radiusKm: radius,
      });
      setDonors(data);
    } catch (err: any) {
      console.error("fetchNearbyDonors error:", err);
      setError(err?.message || "Không thể tải danh sách donor gần bạn.");
      setDonors([]);
    } finally {
      setLoadingDonors(false);
    }
  };

  const locationLabel = useMemo(() => {
    if (currentLocation?.address) return currentLocation.address;
    if (currentLocation) {
      return `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    }
    return "Chưa xác định";
  }, [currentLocation]);

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang xác định vị trí của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black">Nearby Donors</h1>
        <p className="text-gray-600 mt-1">
          Xem những người hiến máu đang mở trạng thái quanh vị trí đã lưu của bạn.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Không thể tải dữ liệu</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-50 p-2 text-red-600">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm text-gray-500">Vị trí đã lưu</p>
              <p className="text-base font-semibold text-gray-900">{locationLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bán kính tìm kiếm: {radiusKm} km</p>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-red-600"
                disabled={!currentLocation}
              />
            </div>
            <button
              type="button"
              onClick={() => fetchNearbyDonors(radiusKm)}
              disabled={!currentLocation || loadingDonors}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-gray-50 flex items-center gap-3">
          <Radar className="w-5 h-5 text-red-600" />
          <p className="text-sm text-gray-600">
            Hệ thống sử dụng tọa độ đã lưu để tìm những người hiến máu đang mở trạng thái trong
            phạm vi bán kính bạn chọn.
          </p>
        </div>
      </div>

      {loadingDonors ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <p className="mt-4 text-gray-600 text-sm">Đang tìm donor quanh bạn...</p>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Chưa tìm thấy donor phù hợp</p>
          <p className="text-sm text-gray-600 mt-2">
            Thử tăng bán kính tìm kiếm hoặc cập nhật lại địa chỉ của bạn.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {donors.map((donor) => (
            <div
              key={donor.donorId || donor.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {donor.fullName || "Ẩn danh"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {donor.email || "Không có email"} · {donor.phoneNumber || "Không có số điện thoại"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase text-gray-500">Nhóm máu</p>
                  <p className="text-xl font-bold text-red-600">{donor.bloodGroup || "?"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{donor.addressDisplay || "Chưa cập nhật địa chỉ"}</span>
                </div>
                <p>
                  Bán kính di chuyển:{" "}
                  <span className="font-semibold">
                    {donor.travelRadiusKm || donor.travelRadiuskm || 0} km
                  </span>
                </p>
                <p>
                  Trạng thái:{" "}
                  <span
                    className={`font-semibold ${
                      donor.isReady ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {donor.isReady ? "Đang sẵn sàng" : "Tạm tắt"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
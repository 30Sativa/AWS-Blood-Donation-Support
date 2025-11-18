// src/pages/member/RegisterDonor.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, AlertCircle, CheckCircle, MapPin } from "lucide-react";
import { profileService } from "@/services/profileService";
import { donorService } from "@/services/donorService";
import type { BloodType, HealthCondition, Availability } from "@/types/donor";
import type { UserProfile } from "@/types/profile";

const WEEKDAYS = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

export function RegisterDonor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReference, setLoadingReference] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);

  const [formData, setFormData] = useState({
    travelRadiusKm: 10,
    isReady: true,
    nextEligibleDate: "",
    availabilities: [] as Availability[],
    healthConditionIds: [] as number[],
    selectedWeekdays: [] as number[],
    timeFrom: "08:00",
    timeTo: "17:00",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingProfile(true);
      setLoadingReference(true);

      // Load profile
      const profileResponse = await profileService.getCurrentUser();
      if (!profileResponse.success || !profileResponse.data) {
        setError("Không thể tải thông tin người dùng");
        return;
      }

      const userProfile = profileResponse.data;
      setProfile(userProfile);

      // Kiểm tra xem đã đăng ký donor chưa
      const donorResponse = await donorService.getMyDonor();
      if (donorResponse && donorResponse.data) {
        // Đã đăng ký donor rồi, redirect đến donor profile
        navigate("/member/donor-profile");
        return;
      }

      // Kiểm tra thông tin bắt buộc
      if (!userProfile.addressId) {
        setError("Bạn chưa có địa chỉ. Vui lòng cập nhật địa chỉ trong Account Settings trước.");
        return;
      }
      if (!userProfile.bloodType) {
        setError("Bạn chưa có nhóm máu. Vui lòng cập nhật nhóm máu trong Account Settings trước.");
        return;
      }

      // Load reference data
      const [bloodTypeList, healthConditionList] = await Promise.all([
        donorService.getBloodTypes(),
        donorService.getHealthConditions(),
      ]);

      setBloodTypes(bloodTypeList);
      setHealthConditions(healthConditionList);
    } catch (err: any) {
      console.error("Load data error:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoadingProfile(false);
      setLoadingReference(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleWeekdayToggle = (weekday: number) => {
    setFormData((prev) => {
      const exists = prev.selectedWeekdays.includes(weekday);
      const updated = exists
        ? prev.selectedWeekdays.filter((w) => w !== weekday)
        : [...prev.selectedWeekdays, weekday];
      return { ...prev, selectedWeekdays: updated };
    });
  };

  const handleHealthConditionToggle = (conditionId: number) => {
    setFormData((prev) => {
      const exists = prev.healthConditionIds.includes(conditionId);
      const updated = exists
        ? prev.healthConditionIds.filter((id) => id !== conditionId)
        : [...prev.healthConditionIds, conditionId];
      return { ...prev, healthConditionIds: updated };
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const validateForm = (): boolean => {
    if (formData.travelRadiusKm < 1 || formData.travelRadiusKm > 100) {
      setError("Bán kính di chuyển phải từ 1-100 km");
      return false;
    }

    // Validate availabilities nếu có chọn
    if (formData.selectedWeekdays.length > 0) {
      const timeFromMin = timeToMinutes(formData.timeFrom);
      const timeToMin = timeToMinutes(formData.timeTo);

      if (timeFromMin >= timeToMin) {
        setError("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Tìm bloodTypeId từ bloodType code
      const bloodType = bloodTypes.find((bt) => bt.code === profile.bloodType);
      if (!bloodType) {
        throw new Error("Không tìm thấy nhóm máu phù hợp");
      }

      // Tạo availabilities từ selected weekdays
      const availabilities: Availability[] = formData.selectedWeekdays.map((weekday) => ({
        weekday,
        timeFromMin: timeToMinutes(formData.timeFrom),
        timeToMin: timeToMinutes(formData.timeTo),
      }));

      // Tạo donor request
      const registerRequest = {
        userId: profile.userId,
        bloodTypeId: bloodType.id,
        addressId: profile.addressId!,
        travelRadiusKm: formData.travelRadiusKm,
        isReady: formData.isReady,
        nextEligibleDate: formData.nextEligibleDate || undefined,
        availabilities: availabilities.length > 0 ? availabilities : undefined,
        healthConditionIds:
          formData.healthConditionIds.length > 0
            ? formData.healthConditionIds
            : undefined,
      };

      const response = await donorService.registerDonor(registerRequest);

      if (response.success) {
        setSuccess("Đăng ký donor thành công! Đang chuyển hướng...");
        setTimeout(() => {
          navigate("/member/donor-profile");
        }, 1500);
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error("Register donor error:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile || loadingReference) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
        <p className="text-red-800">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Đăng Ký Donor</h1>
        <p className="text-gray-600 text-lg">
          Trở thành người hiến máu tình nguyện và cứu sống nhiều người
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Thông tin của bạn:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-blue-700">Họ tên:</span>{" "}
            <span className="font-medium text-blue-900">{profile.fullName}</span>
          </div>
          <div>
            <span className="text-blue-700">Nhóm máu:</span>{" "}
            <span className="font-medium text-blue-900">{profile.bloodType}</span>
          </div>
          <div>
            <span className="text-blue-700">Giới tính:</span>{" "}
            <span className="font-medium text-blue-900">{profile.gender}</span>
          </div>
          <div>
            <span className="text-blue-700">Năm sinh:</span>{" "}
            <span className="font-medium text-blue-900">{profile.birthYear}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 space-y-8">
        {/* Travel Radius */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Bán Kính Di Chuyển</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelRadiusKm">
              Bạn sẵn sàng di chuyển bao xa để hiến máu? (km)
            </Label>
            <Input
              id="travelRadiusKm"
              type="number"
              min="1"
              max="100"
              value={formData.travelRadiusKm}
              onChange={(e) =>
                handleInputChange("travelRadiusKm", parseInt(e.target.value))
              }
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              Hệ thống sẽ tìm kiếm các điểm hiến máu trong bán kính này
            </p>
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Lịch Có Thể Hiến Máu</h2>
          <p className="text-sm text-gray-600">
            Chọn các ngày trong tuần và khung giờ bạn có thể hiến máu (không bắt buộc)
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WEEKDAYS.map((day) => (
                <div key={day.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`weekday-${day.value}`}
                    checked={formData.selectedWeekdays.includes(day.value)}
                    onChange={() => handleWeekdayToggle(day.value)}
                  />
                  <Label htmlFor={`weekday-${day.value}`} className="cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>

            {formData.selectedWeekdays.length > 0 && (
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="timeFrom">Từ giờ</Label>
                  <Input
                    id="timeFrom"
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => handleInputChange("timeFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeTo">Đến giờ</Label>
                  <Input
                    id="timeTo"
                    type="time"
                    value={formData.timeTo}
                    onChange={(e) => handleInputChange("timeTo", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Tình Trạng Sức Khỏe</h2>
          <p className="text-sm text-gray-600">
            Vui lòng chọn các bệnh lý bạn đang mắc phải (nếu có)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthConditions.map((condition) => (
              <div key={condition.id} className="flex items-center gap-2">
                <Checkbox
                  id={`health-${condition.id}`}
                  checked={formData.healthConditionIds.includes(condition.id)}
                  onChange={() => handleHealthConditionToggle(condition.id)}
                />
                <Label htmlFor={`health-${condition.id}`} className="cursor-pointer">
                  {condition.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Status */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Trạng Thái Sẵn Sàng</h2>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              id="isReady"
              checked={formData.isReady}
              onChange={(e) => handleInputChange("isReady", e.target.checked)}
            />
            <Label htmlFor="isReady" className="cursor-pointer font-medium">
              Tôi sẵn sàng hiến máu ngay bây giờ
            </Label>
          </div>
          <p className="text-sm text-gray-500">
            Bạn có thể thay đổi trạng thái này bất cứ lúc nào trong Donor Profile
          </p>
        </div>

        {/* Next Eligible Date */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Ngày Có Thể Hiến Tiếp Theo</h2>
          <div className="space-y-2">
            <Label htmlFor="nextEligibleDate">
              Nếu bạn đã hiến máu gần đây, chọn ngày có thể hiến lại (không bắt buộc)
            </Label>
            <Input
              id="nextEligibleDate"
              type="date"
              value={formData.nextEligibleDate}
              onChange={(e) => handleInputChange("nextEligibleDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              Thời gian phục hồi giữa 2 lần hiến máu thường là 12 tuần (84 ngày)
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white hover:bg-red-700 py-4 text-lg font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              "Đăng Ký Làm Donor"
            )}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Lưu ý quan trọng:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Bạn phải từ 18-60 tuổi để hiến máu</li>
              <li>Cân nặng tối thiểu 45kg</li>
              <li>Khoảng cách giữa 2 lần hiến máu là 12 tuần</li>
              <li>Bạn có thể thay đổi thông tin bất cứ lúc nào trong Donor Profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

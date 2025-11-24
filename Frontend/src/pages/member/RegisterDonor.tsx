// src/pages/member/RegisterDonor.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AddressInput } from "@/components/ui/AddressInput";
import { Heart, Loader2, AlertCircle, CheckCircle, MapPin } from "lucide-react";
import { profileService } from "@/services/profileService";
import { donorService } from "@/services/donorService";
import { addressService } from "@/services/addressService";
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
  const [checkingExistingDonor, setCheckingExistingDonor] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);

  const [formData, setFormData] = useState({
    bloodTypeId: 0,
    travelRadiusKm: 10,
    fullAddress: "",
    availabilities: [] as Availability[],
    healthConditionIds: [] as number[],
    selectedWeekdays: [] as number[],
    timeFrom: "08:00",
    timeTo: "17:00",
  });

  useEffect(() => {
    const checkExistingDonor = async () => {
      try {
        const donorResponse = await donorService.getMyDonor();
        if (donorResponse && donorResponse.data) {
          navigate("/member/donor-profile", { replace: true });
          return;
        }
      } catch (err) {
        console.log(
          "Could not check donor status, continuing with registration form",
          err
        );
      } finally {
        setCheckingExistingDonor(false);
      }
    };

    checkExistingDonor();
  }, [navigate]);

  useEffect(() => {
    if (!checkingExistingDonor) {
      loadData();
    }
  }, [checkingExistingDonor]);

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

      // Load reference data
      const [bloodTypeList, healthConditionList, addressResponse] = await Promise.all([
        donorService.getBloodTypes(),
        donorService.getHealthConditions(),
        addressService.getMyAddress().catch(() => null),
      ]);

      // Sort blood types by code for better UX (A+, A-, B+, B-, AB+, AB-, O+, O-)
      const sortedBloodTypes = [...bloodTypeList].sort((a, b) => {
        const order = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const indexA = order.indexOf(a.code);
        const indexB = order.indexOf(b.code);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setBloodTypes(sortedBloodTypes);
      setHealthConditions(healthConditionList);

      // Load address if exists
      if (addressResponse?.data) {
        // Removed setAddress as address state is not used
        // Format address to fullAddress string
        const parts = [
          addressResponse.data.line1,
          addressResponse.data.district,
          addressResponse.data.city,
          addressResponse.data.province,
          addressResponse.data.country,
        ].filter(Boolean);
        setFormData((prev) => ({
          ...prev,
          fullAddress: addressResponse.data.normalizedAddress || parts.join(", "),
        }));
      }

      // Set default bloodTypeId if user has bloodType in profile
      if (userProfile.bloodType && bloodTypeList.length > 0) {
        const defaultBloodType = bloodTypeList.find((bt) => bt.code === userProfile.bloodType);
        if (defaultBloodType) {
          setFormData((prev) => ({
            ...prev,
            bloodTypeId: defaultBloodType.id,
          }));
        }
      }
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
    if (!formData.bloodTypeId || formData.bloodTypeId === 0) {
      setError("Vui lòng chọn nhóm máu");
      return false;
    }

    if (!formData.fullAddress || formData.fullAddress.trim() === "") {
      setError("Vui lòng nhập địa chỉ");
      return false;
    }

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
      // Tạo availabilities từ selected weekdays
      const availabilities: Availability[] = formData.selectedWeekdays.map((weekday) => ({
        weekday,
        timeFromMin: timeToMinutes(formData.timeFrom),
        timeToMin: timeToMinutes(formData.timeTo),
      }));

      // Tạo donor request theo API mới
      const registerRequest = {
        userId: profile.userId,
        bloodTypeId: formData.bloodTypeId,
        travelRadiusKm: formData.travelRadiusKm,
        fullAddress: formData.fullAddress,
        availabilities: availabilities,
        healthConditionIds: formData.healthConditionIds,
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

  if (checkingExistingDonor) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang kiểm tra trạng thái donor của bạn...</p>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 space-y-8">
        {/* Blood Type Selection */}
        <div className="space-y-4 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">
              Nhóm Máu<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodTypeId" className="text-sm font-semibold text-gray-700">
              Chọn nhóm máu của bạn
            </Label>
            <Select
              id="bloodTypeId"
              value={formData.bloodTypeId}
              onChange={(e) =>
                handleInputChange("bloodTypeId", parseInt(e.target.value))
              }
              className="max-w-xs border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              required
            >
              <option value={0}>-- Chọn nhóm máu --</option>
              {bloodTypes.map((bt) => {
                // Hiển thị format đẹp hơn: chỉ hiển thị code nếu name giống code hoặc không có name
                const displayText = bt.name && bt.name.trim() && bt.name !== bt.code 
                  ? `${bt.code} (${bt.name})` 
                  : bt.code;
                return (
                  <option key={bt.id} value={bt.id}>
                    {displayText}
                  </option>
                );
              })}
            </Select>
            <p className="text-xs text-gray-500 italic">
              Vui lòng chọn nhóm máu của bạn để đăng ký làm donor
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">
              Địa Chỉ<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>
          <div className="space-y-2">
            <AddressInput
              simpleMode={true}
              onAddressChange={(address) => {
                setFormData((prev) => ({
                  ...prev,
                  fullAddress: address,
                }));
              }}
              required
              label=""
            />
          </div>
        </div>

        {/* Travel Radius */}
        <div className="space-y-4 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Bán Kính Di Chuyển<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelRadiusKm" className="text-sm font-semibold text-gray-700">
              Bạn sẵn sàng di chuyển bao xa để hiến máu? (km)
            </Label>
            <Input
              id="travelRadiusKm"
              type="number"
              min="1"
              max="100"
              value={formData.travelRadiusKm}
              onChange={(e) =>
                handleInputChange("travelRadiusKm", parseInt(e.target.value) || 0)
              }
              className="max-w-xs border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-500 italic">
              Hệ thống sẽ tìm kiếm các điểm hiến máu trong bán kính này (1-100 km)
            </p>
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="space-y-4 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Lịch Có Thể Hiến Máu</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Chọn các ngày trong tuần và khung giờ bạn có thể hiến máu (không bắt buộc)
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WEEKDAYS.map((day) => (
                <div key={day.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`weekday-${day.value}`}
                    checked={formData.selectedWeekdays.includes(day.value)}
                    onChange={() => handleWeekdayToggle(day.value)}
                  />
                  <Label htmlFor={`weekday-${day.value}`} className="cursor-pointer text-sm font-medium">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>

            {formData.selectedWeekdays.length > 0 && (
              <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
                <div className="space-y-2">
                  <Label htmlFor="timeFrom" className="text-sm font-semibold text-gray-700">Từ giờ</Label>
                  <Input
                    id="timeFrom"
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => handleInputChange("timeFrom", e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeTo" className="text-sm font-semibold text-gray-700">Đến giờ</Label>
                  <Input
                    id="timeTo"
                    type="time"
                    value={formData.timeTo}
                    onChange={(e) => handleInputChange("timeTo", e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-4 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Tình Trạng Sức Khỏe</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Vui lòng chọn các bệnh lý bạn đang mắc phải (nếu có)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthConditions.map((condition) => (
              <div key={condition.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={`health-${condition.id}`}
                  checked={formData.healthConditionIds.includes(condition.id)}
                  onChange={() => handleHealthConditionToggle(condition.id)}
                />
                <Label htmlFor={`health-${condition.id}`} className="cursor-pointer text-sm font-medium">
                  {condition.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
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

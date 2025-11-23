import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Droplet, Loader2, MapPin } from "lucide-react";
import { AddressInput } from "@/components/ui/AddressInput";
import { profileService } from "@/services/profileService";
import { addressService } from "@/services/addressService";
import { donorService } from "@/services/donorService";
import type { BloodType, HealthCondition, Availability } from "@/types/donor";
import type { Address } from "@/types/address";


const DEFAULT_HEALTH_CONDITIONS: HealthCondition[] = [
  { id: 1, name: "HIV/AIDS" },
  { id: 2, name: "Hepatitis B" },
  { id: 3, name: "Hepatitis C" },
  { id: 4, name: "Diabetes" },
  { id: 5, name: "High blood pressure" },
  { id: 6, name: "Heart disease" },
  { id: 7, name: "Cancer" },
  { id: 8, name: "Other chronic conditions" },
];



const WEEKDAYS = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

interface RegisterFormData {
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  permanentAddress: string;
  currentAddress: string;
  bloodTypeId: number;
  travelRadiusKm: number;
  fullAddress: string;
  selectedWeekdays: number[];
  timeFrom: string;
  timeTo: string;
  healthConditionIds: number[];
  confirm: boolean;
}

export function RegisterDonation() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    DEFAULT_HEALTH_CONDITIONS
  );
  const [donorId, setDonorId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  // Removed addressId and address as they're not used with simpleMode

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    gender: "",
    phone: "",
    email: "",
    permanentAddress: "",
    currentAddress: "",
    bloodTypeId: 0,
    travelRadiusKm: 10,
    fullAddress: "",
    selectedWeekdays: [],
    timeFrom: "08:00",
    timeTo: "17:00",
    healthConditionIds: [],
    confirm: false,
  });

  const handleInputChange = <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
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

  const handleWeekdayToggle = (weekday: number) => {
    setFormData((prev) => {
      const exists = prev.selectedWeekdays.includes(weekday);
      const updated = exists
        ? prev.selectedWeekdays.filter((w) => w !== weekday)
        : [...prev.selectedWeekdays, weekday];
      return { ...prev, selectedWeekdays: updated };
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const formatAddress = (address?: Address | null) => {
    if (!address) return "";
    const parts = [
      address.line1,
      address.district,
      address.city,
      address.province,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");
        const [profileResponse, addressResponse, donorResponse] =
          await Promise.all([
            profileService.getCurrentUser(),
            addressService.getMyAddress().catch(() => null),
            donorService.getMyDonor().catch(() => null),
          ]);

        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data;
          setUserId(profile.userId || null);
          // Removed setAddressIdSafe as addressId is not used with simpleMode
          setFormData((prev) => ({
            ...prev,
            fullName: profile.fullName || "",
            gender: profile.gender || "",
            phone: profile.phoneNumber || "",
            email: profile.email || "",
            // bloodTypeId will be set after loading bloodTypes from API
          }));
        }

        if (donorResponse?.data) {
          setDonorId(donorResponse.data.id ?? null);
        } else {
          setDonorId(null);
        }

        if (addressResponse?.data) {
          // Removed addressId and address handling as they're not used with simpleMode
          const formatted = formatAddress(addressResponse.data);
          const fullAddress = addressResponse.data.normalizedAddress || formatted;
          setFormData((prev) => ({
            ...prev,
            permanentAddress: formatted,
            currentAddress: formatted,
            fullAddress: fullAddress,
          }));
        }
      } catch (err) {
        console.error("Error loading profile/address for donation form:", err);
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError("");
        const [bloodTypeData, healthConditionData] = await Promise.all([
          donorService.getBloodTypes(),
          donorService.getHealthConditions(),
        ]);

        if (bloodTypeData.length) {
          setBloodTypes(bloodTypeData);
          // Set default bloodTypeId from profile if available
          const profileResponse = await profileService.getCurrentUser().catch(() => null);
          if (profileResponse?.data?.bloodType) {
            const defaultBloodType = bloodTypeData.find(
              (bt) => bt.code === profileResponse.data.bloodType
            );
            if (defaultBloodType) {
              setFormData((prev) => ({
                ...prev,
                bloodTypeId: defaultBloodType.id,
              }));
            }
          }
        }

        if (healthConditionData.length) {
          setHealthConditions(healthConditionData);
        }
      } catch (err) {
        console.error("Error loading blood types/health conditions:", err);
        setOptionsError(
          "Không thể tải danh sách nhóm máu hoặc tình trạng sức khỏe. Vui lòng tải lại trang."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");

    try {
      setSubmitting(true);
      let currentDonorId = donorId;

      if (!currentDonorId) {
        if (!userId) {
          setError("Không xác định được tài khoản người dùng. Vui lòng đăng nhập lại.");
          return;
        }
        if (!formData.fullAddress || formData.fullAddress.trim() === "") {
          setError("Vui lòng nhập địa chỉ cư trú trước khi đăng ký.");
          return;
        }
        // Chỉ cần bloodTypeId nếu chưa có donor profile
        if (!currentDonorId && (!formData.bloodTypeId || formData.bloodTypeId === 0)) {
          setError("Vui lòng chọn nhóm máu để đăng ký làm donor.");
          return;
        }

        // Tạo availabilities từ selected weekdays
        const availabilities: Availability[] = formData.selectedWeekdays.map((weekday) => ({
          weekday,
          timeFromMin: timeToMinutes(formData.timeFrom),
          timeToMin: timeToMinutes(formData.timeTo),
        }));

        const registerResponse = await donorService.registerDonor({
          userId: userId!,
          bloodTypeId: formData.bloodTypeId,
          travelRadiusKm: formData.travelRadiusKm,
          fullAddress: formData.fullAddress,
          availabilities: availabilities,
          healthConditionIds: formData.healthConditionIds,
        });

        const newlyCreatedDonorId = registerResponse.data.id ?? null;
        currentDonorId = newlyCreatedDonorId;
        setDonorId(newlyCreatedDonorId);
      }

      if (!currentDonorId) {
        setError("Không thể xác định donor sau khi đăng ký. Vui lòng thử lại.");
        return;
      }

      // Đăng ký donor thành công
      setSuccessMessage("Đăng ký donor thành công! Bạn có thể đặt lịch hiến máu trong phần My Appointments.");
      setFormData((prev) => ({ ...prev, confirm: false }));
    } catch (err: any) {
      console.error("Register donor error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đăng ký donor. Vui lòng thử lại.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile || loadingOptions) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">
          Đang tải dữ liệu hồ sơ và danh sách cần thiết...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Register Donation</h1>
        <p className="text-gray-600 text-lg">Fill in the information to register for blood donation</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {optionsError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
          {optionsError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}


      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-lg p-10 space-y-10">
        {/* Personal Information Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Information<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                Full Name<span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                readOnly
                required
                className="border-gray-300 bg-gray-50 cursor-not-allowed opacity-80"
              />
              <p className="text-xs text-gray-500 italic">
                Chỉnh họ tên trong phần Account Settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                Gender<span className="text-red-600 ml-1">*</span>
              </Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                disabled
                required
                className="border-gray-300 bg-gray-50 cursor-not-allowed opacity-80"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number<span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                readOnly
                required
                className="border-gray-300 bg-gray-50 cursor-not-allowed opacity-80"
              />
              <p className="text-xs text-gray-500 italic">
                Cập nhật số điện thoại trong Account Settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="border-gray-300 bg-gray-50 cursor-not-allowed opacity-75"
              />
              <p className="text-xs text-gray-500 italic">Email is read-only (from your profile)</p>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Address<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>

          <div className="space-y-2">
            <AddressInput
              simpleMode={true}
              onAddressChange={(address) => {
                setFormData((prev) => ({
                  ...prev,
                  fullAddress: address,
                  permanentAddress: address,
                  currentAddress: address,
                }));
              }}
              required
              label=""
            />
          </div>
        </div>

        {/* Blood Type and Donation Info Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Blood Type & Donation Information<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!donorId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                  <Label htmlFor="bloodType" className="text-sm font-semibold text-gray-700">
                    Blood Type<span className="text-red-600 ml-1">*</span>
                  </Label>
                </div>
                <Select
                  id="bloodType"
                  value={formData.bloodTypeId}
                  onChange={(e) => handleInputChange("bloodTypeId", parseInt(e.target.value) || 0)}
                  required={!donorId}
                  className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                >
                  <option value={0}>-- Chọn nhóm máu --</option>
                  {bloodTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.code} - {type.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500 italic">
                  Cần chọn nhóm máu để đăng ký làm donor (nếu bạn chưa có hồ sơ donor)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <Label htmlFor="travelRadiusKm" className="text-sm font-semibold text-gray-700">
                  Bán Kính Di Chuyển (km)<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Input
                id="travelRadiusKm"
                type="number"
                min="1"
                max="100"
                value={formData.travelRadiusKm}
                onChange={(e) => handleInputChange("travelRadiusKm", parseInt(e.target.value) || 0)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 italic">
                Bán kính bạn sẵn sàng di chuyển để hiến máu (1-100 km)
              </p>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Lịch Có Thể Hiến Máu (Tùy chọn)</h3>
            <p className="text-sm text-gray-600">
              Chọn các ngày trong tuần và khung giờ bạn có thể hiến máu
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
                    <Label htmlFor={`weekday-${day.value}`} className="cursor-pointer text-sm">
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

        </div>

        {/* Health Conditions and Notes Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
          </div>

          {/* Health Conditions (Optional) */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Health Conditions <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                List of diseases (if any)
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 shadow-sm">
              {healthConditions.map((condition) => (
                <div
                  key={condition.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/60 transition-colors duration-150"
                >
                  <Checkbox
                    id={`health-${condition.id}`}
                    checked={formData.healthConditionIds.includes(condition.id)}
                    onChange={() => handleHealthConditionToggle(condition.id)}
                  />
                  <Label
                    htmlFor={`health-${condition.id}`}
                    className="font-medium cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {condition.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Section */}
        <div className="space-y-6 pt-6">
          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
            <Checkbox
              id="confirm"
              checked={formData.confirm}
              onChange={(e) => {
                handleInputChange("confirm", e.target.checked);
              }}
              className="mt-1"
            />
            <Label htmlFor="confirm" className="font-medium cursor-pointer text-gray-800 leading-relaxed text-sm">
              (<span className="text-red-600 font-bold">***</span>) I confirm that my information is accurate
              and I voluntarily donate blood under Ministry of Health regulations.
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:from-gray-300 disabled:hover:to-gray-400 py-5 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={!formData.confirm || submitting}
          >
            {submitting ? "Đang gửi..." : "Register Donation"}
          </Button>
        </div>
      </form>
    </div>
  );
}

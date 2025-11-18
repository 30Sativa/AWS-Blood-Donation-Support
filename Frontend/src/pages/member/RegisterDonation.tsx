import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Droplet, Loader2 } from "lucide-react";
import { AddressInput } from "@/components/ui/AddressInput";
import { profileService } from "@/services/profileService";
import { addressService } from "@/services/addressService";
import { donorService } from "@/services/donorService";
import { appointmentService } from "@/services/appointmentService";
import type { BloodType, HealthCondition } from "@/types/donor";
import type { Address } from "@/types/address";

const DEFAULT_BLOOD_TYPES: BloodType[] = [
  { id: 1, name: "O-", code: "O-" },
  { id: 2, name: "O+", code: "O+" },
  { id: 3, name: "A-", code: "A-" },
  { id: 4, name: "A+", code: "A+" },
  { id: 5, name: "B-", code: "B-" },
  { id: 6, name: "B+", code: "B+" },
  { id: 7, name: "AB-", code: "AB-" },
  { id: 8, name: "AB+", code: "AB+" },
];

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

const DONATION_VOLUMES = [
  { value: "350", label: "350ml" },
  { value: "450", label: "450ml" },
];

// TODO: Replace with real hospital/location API once available
const DEFAULT_HOSPITALS = [
  { id: "1", name: "Cho Ray Hospital" },
  { id: "2", name: "Ung Buou Hospital" },
  { id: "3", name: "Bach Mai Hospital" },
  { id: "4", name: "Viet Duc Hospital" },
];

interface RegisterFormData {
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  permanentAddress: string;
  currentAddress: string;
  bloodTypeCode: string;
  donatedBefore: boolean;
  preferredDate: string;
  hospitalId: string;
  bloodVolumeMl: string;
  healthConditionIds: number[];
  notes: string;
  confirm: boolean;
}

export function RegisterDonation() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [donorWarning, setDonorWarning] = useState("");

  const [bloodTypes, setBloodTypes] = useState<BloodType[]>(DEFAULT_BLOOD_TYPES);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    DEFAULT_HEALTH_CONDITIONS
  );
  const [hospitals] = useState(DEFAULT_HOSPITALS);
  const [donorId, setDonorId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const setAddressIdSafe = (value?: number | null) => {
    setAddressId(value ?? null);
  };

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    gender: "",
    phone: "",
    email: "",
    permanentAddress: "",
    currentAddress: "",
    bloodTypeCode: "",
    donatedBefore: false,
    preferredDate: "",
    hospitalId: "",
    bloodVolumeMl: "",
    healthConditionIds: [],
    notes: "",
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
          setAddressIdSafe(profile.addressId);
          setFormData((prev) => ({
            ...prev,
            fullName: profile.fullName || "",
            gender: profile.gender || "",
            phone: profile.phoneNumber || "",
            email: profile.email || "",
            bloodTypeCode: profile.bloodType || "",
            donatedBefore: donorResponse?.data ? true : prev.donatedBefore,
          }));
        }

        if (donorResponse?.data) {
          setDonorId(donorResponse.data.id ?? null);
          setDonorWarning("");
        } else {
          setDonorId(null);
          setDonorWarning(
            "Bạn chưa có hồ sơ donor. Hệ thống sẽ tự tạo khi bạn gửi đăng ký, chỉ cần đảm bảo đã có địa chỉ và chọn nhóm máu."
          );
        }

        if (addressResponse?.data) {
          setAddressIdSafe(addressResponse.data.id);
          setAddress(addressResponse.data);
          const formatted = formatAddress(addressResponse.data);
          setFormData((prev) => ({
            ...prev,
            permanentAddress: formatted,
            currentAddress: formatted,
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
        }

        if (healthConditionData.length) {
          setHealthConditions(healthConditionData);
        }
      } catch (err) {
        console.error("Error loading blood types/health conditions:", err);
        setOptionsError(
          "Không thể tải danh sách nhóm máu hoặc tình trạng sức khỏe. Đang dùng dữ liệu mặc định."
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

    if (!formData.preferredDate) {
      setError("Vui lòng chọn ngày hiến máu.");
      return;
    }

    if (!formData.hospitalId) {
      setError("Vui lòng chọn bệnh viện muốn hiến máu.");
      return;
    }

    try {
      setSubmitting(true);
      let currentDonorId = donorId;

      if (!currentDonorId) {
        if (!userId) {
          setError("Không xác định được tài khoản người dùng. Vui lòng đăng nhập lại.");
          return;
        }
        if (!addressId) {
          setError("Vui lòng thêm địa chỉ cư trú trước khi đăng ký.");
          return;
        }
        if (!formData.bloodTypeCode) {
          setError("Vui lòng chọn nhóm máu.");
          return;
        }

        const bloodType = bloodTypes.find(
          (bt) => bt.code === formData.bloodTypeCode
        );
        if (!bloodType) {
          setError("Không tìm thấy mã nhóm máu phù hợp. Vui lòng chọn lại.");
          return;
        }

        const registerResponse = await donorService.registerDonor({
          userId,
          bloodTypeId: bloodType.id,
          addressId,
          travelRadiusKm: 10,
          isReady: true,
          nextEligibleDate: formData.preferredDate,
          healthConditionIds: formData.healthConditionIds,
        });

        const newlyCreatedDonorId = registerResponse.data.id ?? null;
        currentDonorId = newlyCreatedDonorId;
        setDonorId(newlyCreatedDonorId);
        setDonorWarning("");
      }

      if (!currentDonorId) {
        setError("Không thể xác định donor sau khi đăng ký. Vui lòng thử lại.");
        return;
      }

      const scheduledAt = new Date(`${formData.preferredDate}T09:00:00`).toISOString();
      const locationId = Number(formData.hospitalId);

      const payload = {
        requestId: 0,
        donorId: currentDonorId,
        scheduledAt,
        locationId,
        status: "Pending",
      };

      const response = await appointmentService.createAppointment(payload);
      if (response.success) {
        setSuccessMessage("Đặt lịch hiến máu thành công! Bộ phận điều phối sẽ liên hệ bạn sớm nhất.");
        setFormData((prev) => ({ ...prev, confirm: false }));
      }
    } catch (err: any) {
      console.error("Create appointment error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo lịch hiến máu. Vui lòng thử lại.";
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

      {donorWarning && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
          {donorWarning}
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

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Địa chỉ sẽ dùng để xác định phạm vi hiến máu và liên hệ. Bạn có thể chỉnh sửa trực tiếp tại đây, thông tin sẽ đồng bộ với hồ sơ.
            </p>
            <AddressInput
              value={addressId}
              onChange={(newAddressId, addressData) => {
                setAddressIdSafe(newAddressId);
                if (addressData) {
                  setAddress(addressData);
                  const formatted = formatAddress(addressData);
                  setFormData((prev) => ({
                    ...prev,
                    permanentAddress: formatted,
                    currentAddress: formatted,
                  }));
                }
              }}
              onSaveSuccess={async (newAddressId) => {
                if (newAddressId != null) {
                  setAddressIdSafe(newAddressId);
                  if (userId) {
                    try {
                      await profileService.updateProfile(userId, {
                        id: userId,
                        addressId: newAddressId,
                      });
                      setSuccessMessage("Địa chỉ đã được cập nhật cho hồ sơ của bạn.");
                    } catch (updateError) {
                      console.error("Update profile address error:", updateError);
                      setError("Đã lưu địa chỉ nhưng chưa đồng bộ được lên hồ sơ. Vui lòng kiểm tra lại trong Account Settings.");
                    }
                  }
                }
              }}
              className="w-full"
            />
            {address && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">Địa chỉ hiện tại:</div>
                <p className="mt-1">{formatAddress(address)}</p>
              </div>
            )}
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                <Label htmlFor="bloodType" className="text-sm font-semibold text-gray-700">
                  Blood Type<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Select
                id="bloodType"
                value={formData.bloodTypeCode}
                onChange={(e) => handleInputChange("bloodTypeCode", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="">Choose blood type</option>
                {bloodTypes.map((type) => (
                  <option key={type.id} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodVolumeMl" className="text-sm font-semibold text-gray-700">
                Donation Volume (ml)
              </Label>
              <Select
                id="bloodVolumeMl"
                value={formData.bloodVolumeMl}
                onChange={(e) => handleInputChange("bloodVolumeMl", e.target.value)}
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="">Select volume</option>
                {DONATION_VOLUMES.map((volume) => (
                  <option key={volume.value} value={volume.value}>
                    {volume.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <Label htmlFor="preferredDate" className="text-sm font-semibold text-gray-700">
                  Preferred Donation Date<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600 fill-red-600" />
                <Label htmlFor="hospitalId" className="text-sm font-semibold text-gray-700">
                  Preferred Location (Hospital)<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Select
                id="hospitalId"
                value={formData.hospitalId}
                onChange={(e) => handleInputChange("hospitalId", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="">Select hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Donated Before Checkbox */}
          <div className="flex items-center gap-3 pt-4 p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100/50 transition-colors duration-200">
            <Checkbox
              id="donatedBefore"
              checked={formData.donatedBefore}
              onChange={(e) => handleInputChange("donatedBefore", e.target.checked)}
            />
            <Label htmlFor="donatedBefore" className="font-semibold cursor-pointer text-gray-800 text-base">
              Have you donated before?<span className="text-red-600 ml-1">*</span>
            </Label>
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

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <textarea
              id="notes"
              placeholder="Additional notes (e.g., taking medication, tired,...)"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              rows={4}
            />
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

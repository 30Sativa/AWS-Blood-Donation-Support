// src/pages/member/CompleteProfile.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddressInput } from "@/components/ui/AddressInput";
import { AlertCircle, CheckCircle, User, Mail, Phone, Calendar, Droplet, MapPin } from "lucide-react";
import { profileService } from "@/services/profileService";

const GENDER_OPTIONS = [
  { value: "Male", label: "Nam" },
  { value: "Female", label: "Nữ" },
  { value: "Other", label: "Khác" },
];

const BLOOD_TYPE_OPTIONS = [
  { value: "O-", label: "O-" },
  { value: "O+", label: "O+" },
  { value: "A-", label: "A-" },
  { value: "A+", label: "A+" },
  { value: "B-", label: "B-" },
  { value: "B+", label: "B+" },
  { value: "AB-", label: "AB-" },
  { value: "AB+", label: "AB+" },
];

export function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from || "/member/dashboard";

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    birthYear: "",
    addressId: null as number | null,
    bloodType: "",
  });

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await profileService.getCurrentUser();

      if (!response.success || !response.data) {
        setError("Không thể tải thông tin người dùng");
        return;
      }

      const userProfile = response.data;
      setUserId(userProfile.userId);

      // Điền dữ liệu có sẵn
      setFormData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        gender: userProfile.gender || "",
        birthYear: userProfile.birthYear ? String(userProfile.birthYear) : "",
        addressId: userProfile.addressId || null,
        bloodType: userProfile.bloodType || "",
      });

      // Xác định các trường còn thiếu
      const missing: string[] = [];
      if (!userProfile.fullName) missing.push("Họ tên");
      if (!userProfile.email) missing.push("Email");
      if (!userProfile.phoneNumber) missing.push("Số điện thoại");
      if (!userProfile.gender) missing.push("Giới tính");
      if (!userProfile.birthYear) missing.push("Năm sinh");
      if (!userProfile.addressId) missing.push("Địa chỉ");
      if (!userProfile.bloodType) missing.push("Nhóm máu");

      setMissingFields(missing);
    } catch (err: any) {
      console.error("Load profile error:", err);
      setError("Không thể tải thông tin người dùng");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = (): boolean => {
    if (!formData.fullName?.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }
    if (!formData.email?.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }
    if (!formData.phoneNumber?.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!formData.gender) {
      setError("Vui lòng chọn giới tính");
      return false;
    }
    if (!formData.birthYear) {
      setError("Vui lòng nhập năm sinh");
      return false;
    }

    const birthYear = parseInt(formData.birthYear);
    const currentYear = new Date().getFullYear();
    if (birthYear < 1900 || birthYear > currentYear) {
      setError(`Năm sinh phải từ 1900 đến ${currentYear}`);
      return false;
    }

    // Kiểm tra tuổi (18-60 để hiến máu)
    const age = currentYear - birthYear;
    if (age < 18) {
      setError("Bạn phải từ 18 tuổi trở lên để đăng ký hiến máu");
      return false;
    }
    if (age > 60) {
      setError("Tuổi hiến máu tối đa là 60 tuổi");
      return false;
    }

    if (!formData.addressId) {
      setError("Vui lòng thêm địa chỉ");
      return false;
    }
    if (!formData.bloodType) {
      setError("Vui lòng chọn nhóm máu");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
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
      // Bước 1: Cập nhật profile
      const updateData = {
        id: userId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        birthYear: parseInt(formData.birthYear),
        addressId: formData.addressId!,
        bloodType: formData.bloodType,
      };

      const profileResponse = await profileService.updateProfile(userId, updateData);

      if (!profileResponse.success) {
        throw new Error(profileResponse.message || "Cập nhật profile thất bại");
      }

      setSuccess("Hoàn thành thông tin thành công! Đang chuyển hướng...");

      // Chờ 1.5 giây rồi redirect
      setTimeout(() => {
        navigate(fromPath);
      }, 1500);
    } catch (err: any) {
      console.error("Complete profile error:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-600">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hoàn Thiện Thông Tin
          </h1>
          <p className="text-gray-600">
            Vui lòng điền đầy đủ thông tin để tiếp tục sử dụng hệ thống hiến máu
          </p>
        </div>

        {/* Missing Fields Alert */}
        {missingFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Các thông tin còn thiếu:
                </p>
                <ul className="text-sm text-yellow-700 list-disc list-inside">
                  {missingFields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <Label htmlFor="fullName" className="text-gray-900">
                  Họ và tên <span className="text-red-600">*</span>
                </Label>
              </div>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <Label htmlFor="email" className="text-gray-900">
                    Email <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <Label htmlFor="phoneNumber" className="text-gray-900">
                    Số điện thoại <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Gender & Birth Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <Label htmlFor="gender" className="text-gray-900">
                    Giới tính <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">Chọn giới tính</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <Label htmlFor="birthYear" className="text-gray-900">
                    Năm sinh <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="1990"
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange("birthYear", e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <Label className="text-gray-900">
                  Địa chỉ <span className="text-red-600">*</span>
                </Label>
              </div>
              <AddressInput
                value={formData.addressId}
                onChange={(addressId) => handleInputChange("addressId", addressId)}
                onSaveSuccess={async (addressId) => {
                  if (userId && addressId) {
                    try {
                      await profileService.updateProfile(userId, { id: userId, addressId });
                      handleInputChange("addressId", addressId);
                    } catch (err) {
                      console.error("Update addressId error:", err);
                    }
                  }
                }}
                className="w-full"
              />
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-gray-600" />
                <Label htmlFor="bloodType" className="text-gray-900">
                  Nhóm máu <span className="text-red-600">*</span>
                </Label>
              </div>
              <Select
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
                required
                className="w-full"
              >
                <option value="">Chọn nhóm máu</option>
                {BLOOD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white hover:bg-red-700 py-3 text-lg font-semibold"
              >
                {loading ? "Đang xử lý..." : "Hoàn Thành & Tiếp Tục"}
              </Button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Tại sao cần thông tin này?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Xác định điều kiện hiến máu (tuổi, nhóm máu)</li>
                <li>Liên hệ khi có yêu cầu khẩn cấp</li>
                <li>Tìm kiếm donor gần vị trí của bạn</li>
                <li>Quản lý lịch sử và thống kê hiến máu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

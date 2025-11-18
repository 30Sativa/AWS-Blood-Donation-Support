import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddressInput } from "@/components/ui/AddressInput";
import { User, Mail, Phone, Calendar, Droplet } from "lucide-react";
import { profileService } from "@/services/profileService";
import type { Address } from "@/types/address";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Orther" },
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

export function AccountSettings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "", // Lưu dạng "YYYY-01-01" để tương thích với logic hiện tại
    gender: "",
    addressId: null as number | null,
    bloodType: "",
  });
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");

        // Sử dụng endpoint /api/Users/me để lấy thông tin user hiện tại
        console.log("[DEBUG] AccountSettings: Loading profile using getCurrentUser()");
        const response = await profileService.getCurrentUser();
        console.log("[DEBUG] AccountSettings: Received profile response", response);
        if (response.success && response.data) {
          const profile = response.data;
          
          // Lưu userId để sử dụng khi update
          setUserId(profile.userId);
          if (profile.userId) {
            localStorage.setItem("userId", String(profile.userId));
          }
          
          const birthDate = profile.birthYear 
            ? `${profile.birthYear}-01-01` 
            : "";

          setFormData({
            name: profile.fullName || "",
            email: profile.email || "",
            phone: profile.phoneNumber || "",
            dateOfBirth: birthDate,
            gender: profile.gender || "",
            addressId: profile.addressId || null,
            bloodType: profile.bloodType || "",
          });
        } else {
          // Nếu response không có data hoặc success = false
          setError(response.message || "Không thể tải thông tin profile. Vui lòng thử lại.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải thông tin";
        setError(errorMessage);
        console.error("Error loading profile in AccountSettings:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    // Validate form trước khi submit
    if (!formData.name?.trim()) {
      setError("Vui lòng nhập tên");
      return;
    }
    if (!formData.email?.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!formData.phone?.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (!formData.gender) {
      setError("Vui lòng chọn giới tính");
      return;
    }
    if (!formData.dateOfBirth) {
      setError("Vui lòng nhập năm sinh");
      return;
    }

    // Validate năm sinh
    if (formData.dateOfBirth) {
      const birthYear = new Date(formData.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
        setError(`Năm sinh phải từ 1900 đến ${currentYear}`);
        return;
      }
    }

    // Note: Address không bắt buộc, nhưng nếu có thì phải đã được lưu (có addressId)
    // Validation address sẽ được xử lý trong AddressInput component

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const birthYear = formData.dateOfBirth 
        ? new Date(formData.dateOfBirth).getFullYear()
        : undefined;

      const updateData = {
        id: userId,
        email: formData.email,
        phoneNumber: formData.phone,
        fullName: formData.name,
        birthYear: birthYear,
        gender: formData.gender || undefined,
        addressId: formData.addressId || undefined,
        bloodType: formData.bloodType || undefined,
      };

      console.log("[DEBUG] AccountSettings: Updating profile with data:", updateData);
      const response = await profileService.updateProfile(userId, updateData);
      console.log("[DEBUG] AccountSettings: Update profile response:", response);
      
      if (response.success) {
        setSuccess("Cập nhật thông tin thành công!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      console.error("[ERROR] AccountSettings: Update profile error:", err);
      
      // Xử lý lỗi 403 Forbidden
      if (err.response?.status === 403) {
        setError("Bạn không có quyền cập nhật thông tin này. Vui lòng kiểm tra lại quyền truy cập hoặc đăng nhập lại.");
      } else if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật thông tin";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Account settings</h1>
        <p className="text-gray-600 mt-1">Setting and changing personal information</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-3xl">
        {loadingProfile ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Đang tải thông tin...</div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <Label htmlFor="name" className="text-black">
                Name<span className="text-red-600">*</span>
              </Label>
            </div>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <Label htmlFor="email" className="text-black">
                Email<span className="text-red-600">*</span>
              </Label>
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <Label htmlFor="phone" className="text-black">
                  Phone<span className="text-red-600">*</span>
                </Label>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="123 456 7890"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <Label htmlFor="gender" className="text-black">
                  Gender<span className="text-red-600">*</span>
                </Label>
              </div>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                required
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Choose gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <Label htmlFor="dateOfBirth" className="text-black">
                Year of birth<span className="text-red-600">*</span>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="dateOfBirth"
                type="number"
                placeholder="YYYY (e.g., 1990)"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).getFullYear() : ""}
                onChange={(e) => {
                  const year = e.target.value;
                  if (year === "") {
                    handleInputChange("dateOfBirth", "");
                  } else {
                    // Cho phép nhập bất kỳ giá trị nào, validate sẽ được kiểm tra khi submit
                    const yearNum = parseInt(year);
                    if (!isNaN(yearNum)) {
                      handleInputChange("dateOfBirth", `${year}-01-01`);
                    }
                  }
                }}
                onBlur={(e) => {
                  // Clear error nếu năm hợp lệ
                  const year = parseInt(e.target.value);
                  const currentYear = new Date().getFullYear();
                  if (year && year >= 1900 && year <= currentYear) {
                    setError(""); // Clear error nếu hợp lệ
                  }
                }}
                min="1900"
                max={new Date().getFullYear()}
                required
                className="w-full pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-6">
            <AddressInput
              label="Address"
              value={formData.addressId}
              onChange={(addressId, addressData) => {
                setFormData((prev) => ({ ...prev, addressId: addressId || null }));
                setAddress(addressData);
              }}
              onSaveSuccess={async (addressId) => {
                // Tự động cập nhật profile với addressId mới khi lưu address thành công
                if (userId && addressId) {
                  try {
                    const updateData = {
                      id: userId,
                      addressId: addressId,
                    };
                    await profileService.updateProfile(userId, updateData);
                    // Cập nhật formData để đảm bảo đồng bộ
                    setFormData((prev) => ({ ...prev, addressId: addressId }));
                    setSuccess("Địa chỉ đã được lưu và cập nhật vào profile!");
                  } catch (err) {
                    console.error("Error updating profile with addressId:", err);
                    setError("Địa chỉ đã được lưu nhưng chưa cập nhật vào profile. Vui lòng nhấn 'Update Information' để hoàn tất.");
                  }
                }
              }}
              className="w-full"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-gray-600" />
                <Label htmlFor="bloodType" className="text-black">
                  Blood Type
                </Label>
              </div>
              <Select
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Choose blood type</option>
                {BLOOD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700 py-3 px-8 text-base font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang cập nhật..." : "Update Information"}
            </Button>
          </div>
        </form>
        )}

        </div>
      </div>
    </div>
  );
}


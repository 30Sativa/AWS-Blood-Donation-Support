import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, MapPin, Droplet } from "lucide-react";
import { profileService } from "@/services/profileService";

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

const getUserIdFromToken = (): number | null => {
  try {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      const userId = Number(savedUserId);
      if (!isNaN(userId)) return userId;
    }

    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    
    const userId = 
      decoded.userId || 
      decoded.user_id || 
      decoded.UserId || 
      decoded.sub || 
      decoded.id || 
      decoded.nameid ||
      decoded.unique_name ||
      null;
    
    if (userId) {
      const numUserId = Number(userId);
      if (!isNaN(numUserId)) {
        localStorage.setItem("userId", String(numUserId));
        return numUserId;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export function AccountSettings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "", // Lưu dạng "YYYY-01-01" để tương thích với logic hiện tại
    gender: "",
    address: "",
    bloodType: "",
  });
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
        
        const currentUserId = getUserIdFromToken();
        if (!currentUserId) {
          setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
          setLoadingProfile(false);
          return;
        }

        setUserId(currentUserId);

        const response = await profileService.getProfile(currentUserId);
        if (response.success && response.data) {
          const profile = response.data;
          
          const birthDate = profile.birthYear 
            ? `${profile.birthYear}-01-01` 
            : "";

          setFormData({
            name: profile.fullName || "",
            email: profile.email || "",
            phone: profile.phoneNumber || "",
            dateOfBirth: birthDate,
            gender: profile.gender || "",
            address: profile.address || "",
            bloodType: profile.bloodType || "",
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải thông tin";
        setError(errorMessage);
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

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate năm sinh
      if (formData.dateOfBirth) {
        const birthYear = new Date(formData.dateOfBirth).getFullYear();
        const currentYear = new Date().getFullYear();
        if (birthYear < 1900 || birthYear > currentYear) {
          setError(`Năm sinh phải từ 1900 đến ${currentYear}`);
          setLoading(false);
          return;
        }
      }

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
        address: formData.address || undefined,
        bloodType: formData.bloodType || undefined,
      };

      const response = await profileService.updateProfile(userId, updateData);
      
      if (response.success) {
        setSuccess("Cập nhật thông tin thành công!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Cập nhật thất bại");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật thông tin";
      setError(errorMessage);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <Label htmlFor="address" className="text-black">
                  Address
                </Label>
              </div>
              <Input
                id="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

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


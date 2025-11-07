import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { profileService } from "@/services/profileService";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Orther" },
];

// Helper function để decode JWT token và lấy userId
const getUserIdFromToken = (): number | null => {
  try {
    // Thử lấy userId từ localStorage trước (nếu đã lưu khi login)
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      const userId = Number(savedUserId);
      if (!isNaN(userId)) return userId;
    }

    // Nếu không có, thử decode từ JWT token
    const token = localStorage.getItem("token");
    if (!token) return null;

    // JWT token có format: header.payload.signature
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    
    // Debug: log để xem token có gì
    // eslint-disable-next-line no-console
    console.log("Decoded JWT token:", decoded);
    
    // Thử các field phổ biến cho userId và convert sang number
    const userId = 
      decoded.userId || 
      decoded.user_id || 
      decoded.UserId || 
      decoded.sub || 
      decoded.id || 
      decoded.nameid || // ASP.NET thường dùng nameid
      decoded.unique_name ||
      null;
    
    if (userId) {
      const numUserId = Number(userId);
      if (!isNaN(numUserId)) {
        // Lưu vào localStorage để dùng lần sau
        localStorage.setItem("userId", String(numUserId));
        return numUserId;
      }
    }
    
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error decoding token:", error);
    return null;
  }
};

export function AccountSettings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Load profile khi component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");
        
        // Lấy userId từ token
        const currentUserId = getUserIdFromToken();
        if (!currentUserId) {
          setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
          setLoadingProfile(false);
          return;
        }

        setUserId(currentUserId);

        // Load profile từ API
        const response = await profileService.getProfile(currentUserId);
        if (response.success && response.data) {
          const profile = response.data;
          
          // Convert birthYear thành dateOfBirth (YYYY-MM-DD format)
          const birthDate = profile.birthYear 
            ? `${profile.birthYear}-01-01` 
            : "";

          setFormData({
            name: profile.fullName || "",
            email: profile.email || "",
            phone: profile.phoneNumber || "",
            dateOfBirth: birthDate,
            gender: profile.gender || "",
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
    // Clear error khi user bắt đầu nhập
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
      // Convert dateOfBirth thành birthYear
      const birthYear = formData.dateOfBirth 
        ? new Date(formData.dateOfBirth).getFullYear()
        : undefined;

      // Chuẩn bị data theo format API
      const updateData = {
        id: userId,
        email: formData.email,
        phoneNumber: formData.phone,
        fullName: formData.name,
        birthYear: birthYear,
        gender: formData.gender || undefined,
        // roleCode và isActive có thể không cần gửi nếu API tự xử lý
      };

      const response = await profileService.updateProfile(userId, updateData);
      
      if (response.success) {
        setSuccess("Cập nhật thông tin thành công!");
        // Reload profile sau 1.5s
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Account Settings Form */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-3xl">
        {loadingProfile ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Đang tải thông tin...</div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
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

          {/* Email Field */}
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

          {/* Phone and Gender - Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Field */}
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

            {/* Gender Field */}
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

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <Label htmlFor="dateOfBirth" className="text-black">
                Date of birth<span className="text-red-600">*</span>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="dateOfBirth"
                type="date"
                placeholder="dd/mm/yyyy"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
                className="w-full pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Update Button */}
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


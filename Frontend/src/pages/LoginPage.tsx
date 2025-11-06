import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { Droplet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <--- ĐÃ THÊM

type AuthMode = "login" | "register";

const BLOOD_TYPES = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

// Helper to validate email length (max 255 chars per database)
const validateEmailLength = (email: string): boolean => {
  return email.length <= 255;
};

// Helper to validate full name length (max 200 chars per database)
const validateFullNameLength = (name: string): boolean => {
  return name.length <= 200;
};

// Helper to validate phone number length (max 30 chars per database)
const validatePhoneLength = (phone: string): boolean => {
  return phone.length <= 30;
};

// Get current year for birth year validation
const currentYear = new Date().getFullYear();
const minBirthYear = currentYear - 100; // Max age 100
const maxBirthYear = currentYear - 18; // Min age 18 to donate

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth(); // <--- ĐÃ THÊM: Lấy hàm refreshAuth
  const [mode, setMode] = useState<AuthMode>(
    location.pathname.includes("register") ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Register fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        // Validate login fields
        if (!email || !password) {
          setError("Vui lòng điền đầy đủ thông tin");
          setLoading(false);
          return;
        }

        if (!validateEmailLength(email)) {
          setError("Email không được vượt quá 255 ký tự");
          setLoading(false);
          return;
        }

        const response = await authService.login({ email, password });
        setSuccess("Đăng nhập thành công!");

        // Debug: log full response so we can see where the token is
        // eslint-disable-next-line no-console
        console.log("Login response:", response);

        type Role = "member" | "staff" | "admin";
        let userRole: Role = "member"; // Gán mặc định là member

        // 💡 BƯỚC 1: XÁC ĐỊNH EMAIL VÀ TÊN NGƯỜI DÙNG
        const userEmail = response.user?.email || email;
        // Ưu tiên dùng fullName/name từ response, nếu không có thì dùng phần trước @ của email
        const userName = response.user?.fullName
          || response.user?.name
          || userEmail.split('@')[0];

        // 💡 BƯỚC 2: XÁC ĐỊNH ROLE
        if (userEmail.includes("admin")) {
          userRole = "admin";
        } else if (userEmail.includes("staff")) {
          userRole = "staff";
        }

        // 💡 BƯỚC 3: LƯU THÔNG TIN CẦN THIẾT VÀO LOCAL STORAGE (Đã thêm userName và userEmail)
        if (response.token) {
          try {
            localStorage.setItem("token", response.token);
            localStorage.setItem("role", userRole); // luu role tai day
            localStorage.setItem("userEmail", userEmail);
            localStorage.setItem("userName", userName); // <-- LƯU TÊN NGƯỜI DÙNG
            sessionStorage.setItem("token", response.token);

            // 💡 GỌI REFRESH AUTH NGAY SAU KHI LƯU DỮ LIỆU MỚI
            refreshAuth(); // <--- ĐÃ THÊM: Cập nhật Context state ngay lập tức

          } catch (e) {
            // ignore storage errors (e.g., private mode)
            // eslint-disable-next-line no-console
            console.warn("Unable to save token to storage:", e);
          }
        }

        // 💡 BƯỚC 4: CHUYỂN HƯỚNG VỀ HOMEPAGE (`/`)
        navigate("/", { replace: true });

      } else {
        // Validate register fields
        if (!fullName || !email || !password) {
          setError("Vui lòng điền đầy đủ các trường bắt buộc");
          setLoading(false);
          return;
        }

        if (!validateFullNameLength(fullName)) {
          setError("Họ và tên không được vượt quá 200 ký tự");
          setLoading(false);
          return;
        }

        if (!validateEmailLength(email)) {
          setError("Email không được vượt quá 255 ký tự");
          setLoading(false);
          return;
        }

        if (phoneNumber && !validatePhoneLength(phoneNumber)) {
          setError("Số điện thoại không được vượt quá 30 ký tự");
          setLoading(false);
          return;
        }

        if (birthYear) {
          const year = parseInt(birthYear);
          if (isNaN(year) || year < minBirthYear || year > maxBirthYear) {
            setError(`Năm sinh phải từ ${minBirthYear} đến ${maxBirthYear} (từ 18 đến 100 tuổi)`);
            setLoading(false);
            return;
          }
        }

        await authService.register({
          fullName,
          email,
          phoneNumber: phoneNumber || undefined,
          gender: gender || undefined,
          birthYear: birthYear ? parseInt(birthYear) : undefined,
          bloodType: bloodType || undefined,
          password,
        });
        setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        setMode("login");
        setPassword("");
        setFullName("");
        setPhoneNumber("");
        setGender("");
        setBirthYear("");
        setBloodType("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back to home link */}
      <div className="p-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Quay lại trang chủ
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>

          {/* Greeting */}
          <h1 className="text-2xl font-bold text-center mb-2">Chào mừng bạn</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Đăng nhập hoặc tạo tài khoản để tiếp tục
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
                setFullName("");
                setPhoneNumber("");
                setGender("");
                setBirthYear("");
                setBloodType("");
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/auth/register", { replace: true });
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - Only for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500">Tối đa 200 ký tự</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
              {mode === "register" && (
                <p className="text-xs text-gray-500">Tối đa 255 ký tự</p>
              )}
            </div>

            {/* Phone Number - Only for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0901234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={30}
                />
                <p className="text-xs text-gray-500">Tùy chọn (tối đa 30 ký tự)</p>
              </div>
            )}

            {/* Gender - Only for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Chọn giới tính (tùy chọn)</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Birth Year - Only for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="birthYear">Năm sinh</Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="1990"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  min={minBirthYear}
                  max={maxBirthYear}
                />
                <p className="text-xs text-gray-500">
                  Tùy chọn ({minBirthYear} - {maxBirthYear})
                </p>
              </div>
            )}

            {/* Blood Type - Only for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="bloodType">Nhóm máu</Label>
                <Select
                  id="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="">Chọn nhóm máu (tùy chọn)</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {success}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>

          {/* Demo info */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-600 mb-2">
              Demo: Dùng email có "staff" để vào trang quản lý
            </p>
            <p className="text-xs text-gray-500">
              VD: staff@example.com / member@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
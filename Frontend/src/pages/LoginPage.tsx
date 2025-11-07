

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { Droplet } from "lucide-react";

// Import thêm useNavigate và useAuth
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // (Đảm bảo đúng đường dẫn)

type AuthMode = "login" | "register";

// ... (Các hằng số BLOOD_TYPES, GENDER_OPTIONS giữ nguyên) ...
const BLOOD_TYPES = [
  "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+",
];
const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

const currentYear = new Date().getFullYear();
const minBirthYear = currentYear - 100;
const maxBirthYear = currentYear - 18;

export default function LoginPage() {
  const [searchParams] = useSearchParams();

  // Khởi tạo navigate và useAuth
  const navigate = useNavigate();
  const { refreshAuth } = useAuth(); // Lấy hàm refresh từ Context

  const [mode, setMode] = useState<AuthMode>(() => {
    const initialMode = searchParams.get("mode") as AuthMode | null;
    return initialMode === "register" ? "register" : "login";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const modeParam = searchParams.get("mode") as AuthMode | null;
    if (modeParam === "login" || modeParam === "register") {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        

        const response = await authService.login({ email, password });
        setSuccess("Đăng nhập thành công!");
        console.log("Login response:", response);

        //  LƯU DATA MÀ AUTHCONTEXT CẦN
        if (response.token && response.user) {
          try {
            localStorage.setItem("token", response.token);
            sessionStorage.setItem("token", response.token);

            // Xác định vai trò (role) - Giả định logic dựa trên email
            const userRole = response.user.email.includes("admin") ? "admin" :
              response.user.email.includes("staff") ? "staff" : "member";

            // Lấy ID và Tên (fullName) từ response.user
            const userId = response.user.id;
            const userName = (response.user as { fullName?: string }).fullName || '';

            localStorage.setItem("role", userRole); // ⭐️ LƯU ROLE
            localStorage.setItem("userEmail", response.user.email); // ⭐️ LƯU EMAIL
            localStorage.setItem("userName", userName); // ⭐️ LƯU USERNAME

            if (userId) {
              localStorage.setItem("userId", String(userId)); // ⭐️ LƯU USERID
            }

            // ⭐️ BƯỚC 4: BÁO CHO CONTEXT TẢI LẠI STATE
            refreshAuth();

          } catch (e) {
            console.warn("Unable to save token to storage:", e);
          }
        }

        // ⭐️ BƯỚC 5: SỬ DỤNG NAVIGATE (thay vì window.location.href)
        if (response.user?.email.includes("admin")) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/member/dashboard", { replace: true });
        }

      } else {
        // Register
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
        // ... (Reset fields) ...
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

            {/* Forgot password link - Only show in login mode */}
            {mode === "login" && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}
            
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
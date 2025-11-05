import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { Droplet, LogOut } from "lucide-react";
import { toast } from 'react-toastify';
import { ACCESS_TOKEN, USER, commonSettings } from '@/utils/setting';

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

// Helper to convert phone number: 0xxx -> +84xxx
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return phone;
  // Remove all spaces and special characters except +
  const cleaned = phone.replace(/\s+/g, '').trim();
  // If starts with 0, replace with +84
  if (cleaned.startsWith('0')) {
    return '+84' + cleaned.substring(1);
  }
  // If already starts with +84, return as is
  if (cleaned.startsWith('+84')) {
    return cleaned;
  }
  // If starts with 84 (without +), add +
  if (cleaned.startsWith('84')) {
    return '+' + cleaned;
  }
  // Otherwise return as is
  return cleaned;
};

// Get current year for birth year validation
const currentYear = new Date().getFullYear();
const minBirthYear = currentYear - 100; // Max age 100
const maxBirthYear = currentYear - 18; // Min age 18 to donate

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
  const isSubmittingRef = useRef(false);
  
  // Check if user is already logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = commonSettings.getStorage<string>(ACCESS_TOKEN);
      const user = commonSettings.getStorageJson(USER);
      if (token) {
        setIsAuthenticated(true);
        // Use user from storage or fallback to email from form
        if (user) {
          setUserInfo(user);
        } else if (email) {
          setUserInfo({ email });
        }
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    };
    
    checkAuth();
  }, [email]);

  // Update mode when query param changes
  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthMode;
    if (modeParam === 'login' || modeParam === 'register') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleLogout = () => {
    commonSettings.clearStorageItem(ACCESS_TOKEN);
    commonSettings.clearStorageItem(USER);
    setIsAuthenticated(false);
    setUserInfo(null);
    toast.success('Đăng xuất thành công!');
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission - check ref immediately (synchronous)
    if (isSubmittingRef.current || loading) {
      return;
    }
    
    isSubmittingRef.current = true;
    setError("");
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
        toast.success('Đăng nhập thành công!');
        
        // Wait a bit for localStorage to be updated by authService
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update authentication state from localStorage (ensures consistency)
        const user = commonSettings.getStorageJson<any>(USER);
        setIsAuthenticated(true);
        setUserInfo(user || response.user || { email });

        // Clear form fields
        setEmail("");
        setPassword("");
        
        // Small delay before redirect to allow UI to update
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 800);
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

        if (birthYear) {
          const year = parseInt(birthYear);
          if (isNaN(year) || year < minBirthYear || year > maxBirthYear) {
            setError(`Năm sinh phải từ ${minBirthYear} đến ${maxBirthYear} (từ 18 đến 100 tuổi)`);
            setLoading(false);
            return;
          }
        }

        // Format phone number: convert 0xxx to +84xxx
        const formattedPhone = phoneNumber ? formatPhoneNumber(phoneNumber) : undefined;
        
        // Validate formatted phone number length
        if (formattedPhone && !validatePhoneLength(formattedPhone)) {
          setError("Số điện thoại không được vượt quá 30 ký tự");
          setLoading(false);
          return;
        }
        
        // Map gender to API format (Male/Female/Other)
        const genderMap: Record<string, string> = {
          'Nam': 'Male',
          'Nữ': 'Female',
          'Khác': 'Other',
        };
        const apiGender = gender ? genderMap[gender] || gender : undefined;

        const response = await authService.register({
          fullName,
          email,
          phoneNumber: formattedPhone,
          gender: apiGender,
          birthYear: birthYear ? parseInt(birthYear) : undefined,
          bloodType: bloodType || undefined,
          password,
        });
        
        toast.success(response.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
        setMode("login");
        setPassword("");
        setFullName("");
        setPhoneNumber("");
        setGender("");
        setBirthYear("");
        setBloodType("");
        setError("");
      }
    } catch (err: any) {
      const message = err?.message || (err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // (đã dùng submit handler ở trên)

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

          {/* If user is authenticated, show logout UI */}
          {isAuthenticated ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Bạn đã đăng nhập</h1>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Email: <span className="font-semibold">{userInfo?.email || 'N/A'}</span>
                </p>
                {userInfo?.fullName && (
                  <p className="text-sm text-gray-600 mb-2">
                    Tên: <span className="font-semibold">{userInfo.fullName}</span>
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
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
                    navigate("/login?mode=login", { replace: true });
                    setError("");
                    setFullName("");
                    setPhoneNumber("");
                    setGender("");
                    setBirthYear("");
                    setBloodType("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    mode === "login"
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
                    navigate("/login?mode=register", { replace: true });
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    mode === "register"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}


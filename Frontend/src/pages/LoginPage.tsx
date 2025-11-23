import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { Droplet } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type AuthMode = "login" | "register";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const currentYear = new Date().getFullYear();

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required.")
    .email("Invalid email format.")
    .max(255, "Email must not exceed 255 characters."),
  password: Yup.string()
    .required("Password is required."),
});

const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .required("Full name is required.")
    .max(200, "Full name must not exceed 200 characters."),
  email: Yup.string()
    .required("Email is required.")
    .email("Invalid email format.")
    .max(255, "Email must not exceed 255 characters."),
  phoneNumber: Yup.string()
    .required("Phone number is required.")
    .matches(/^\+?[1-9]\d{1,15}$/, "Invalid phone number format."),
  password: Yup.string()
    .required("Password is required.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
      "Password must have at least 8 characters, including upper/lowercase, number and special symbol."
    ),
  gender: Yup.string()
    .oneOf(["Male", "Female", "Other", ""], "Gender must be one of: Male, Female, Other.")
    .nullable()
    .required("Gender is required."),
  birthYear: Yup.string()
    .required("Birth year is required.")
    .test(
      "is-valid-year",
      `Birth year must be between 1900 and ${currentYear}.`,
      function (value) {
        if (!value || value.trim() === "") {
          return false;
        }
        const year = parseInt(value);
        return (
          !isNaN(year) &&
          Number.isInteger(year) &&
          year >= 1900 &&
          year <= currentYear
        );
      }
    ),
});

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [mode, setMode] = useState<AuthMode>(() => {
    const initialMode = searchParams.get("mode") as AuthMode | null;
    return initialMode === "register" ? "register" : "login";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validationSchema = useMemo(
    () => (mode === "login" ? loginSchema : registerSchema),
    [mode]
  );

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      gender: "",
      birthYear: "",
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    validateOnMount: false,
    onSubmit: async (values) => {
      setError("");
      setSuccess("");
      setLoading(true);

      try {
        if (mode === "login") {
          const response = await authService.login({
            email: values.email,
            password: values.password,
          });

          setSuccess("Login successful!");

          if (response.token && response.user) {
            try {
              // ✅ Prefer roles from backend: e.g. ["ADMIN", "STAFF"]
              const backendRoles = response.roles ?? [];
              const normalizedRoles = backendRoles.map((r) => r.toLowerCase());

              let userRole: "admin" | "staff" | "member";

              if (normalizedRoles.includes("admin")) {
                userRole = "admin";
              } else if (normalizedRoles.includes("staff")) {
                userRole = "staff";
              } else {
                // Fallback to email-based inference if no usable backend role
                const inferredRoleFromEmail = response.user.email.includes("admin")
                  ? "admin"
                  : response.user.email.includes("staff")
                    ? "staff"
                    : "member";

                userRole = inferredRoleFromEmail;
              }

              // Save auth info
              localStorage.setItem("token", response.token);
              sessionStorage.setItem("token", response.token);

              // Lưu expiration time (sử dụng expiresIn từ backend hoặc mặc định 24 giờ)
              const expiresIn = response.expiresIn || 86400; // 86400 seconds = 24 hours
              const expirationTime = Date.now() + (expiresIn * 1000);
              localStorage.setItem("tokenExpiry", String(expirationTime));

              const userId = response.user.id;
              const userName =
                (response.user as { fullName?: string }).fullName || "";

              localStorage.setItem("role", userRole);
              localStorage.setItem("userEmail", response.user.email);
              localStorage.setItem("userName", userName);

              if (userId) {
                localStorage.setItem("userId", String(userId));
              }

              // Update AuthContext
              refreshAuth();

              // Sau khi login, chuyển về trang chủ
              navigate("/", { replace: true });
            } catch (e) {
              console.warn("Unable to save token to storage:", e);
            }
          }
        } else {
          // register mode
          await authService.register({
            fullName: values.fullName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            gender: values.gender,
            birthYear: parseInt(values.birthYear),
            password: values.password,
          });

          setSuccess("Registration successful! Please check your email for confirmation code.");
          
          // Redirect to confirm email page after 1.5 seconds
          setTimeout(() => {
            navigate(`/confirm-email?email=${encodeURIComponent(values.email)}`, { replace: true });
          }, 1500);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        
        // Check if user needs to verify email
        if (
          errorMessage.toLowerCase().includes("not confirmed") ||
          errorMessage.toLowerCase().includes("verify your email") ||
          errorMessage.toLowerCase().includes("email not verified") ||
          errorMessage.toLowerCase().includes("please verify")
        ) {
          // Redirect to confirm email page
          setError("Please verify your email first. Redirecting to confirmation page...");
          setTimeout(() => {
            navigate(`/confirm-email?email=${encodeURIComponent(values.email)}`, { replace: true });
          }, 1500);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const modeParam = searchParams.get("mode") as AuthMode | null;
    if (modeParam === "login" || modeParam === "register") {
      if (modeParam !== mode) {
        setMode(modeParam);
        formik.resetForm();
        setError("");
        setSuccess("");
      }
    }
  }, [searchParams, mode, formik]);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    formik.resetForm();
  };

  const { ref: formRef, isVisible: formVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="p-6 relative z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:gap-3 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div 
          ref={formRef}
          className={`w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transition-all duration-1000 ${
            formVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 hover:rotate-12 transform group">
              <Droplet className="w-8 h-8 text-white group-hover:animate-pulse" fill="currentColor" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Welcome
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Login or create an account to continue
          </p>

          <div className="flex gap-2 mb-6 border-b relative">
            <div 
              className={`absolute bottom-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-in-out ${
                mode === "login" ? "left-0 w-1/2" : "left-1/2 w-1/2"
              }`}
            ></div>
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 relative z-10 ${
                mode === "login"
                  ? "text-red-600 font-semibold scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:scale-105"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 relative z-10 ${
                mode === "register"
                  ? "text-red-600 font-semibold scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:scale-105"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            {mode === "register" && (
              <div className={`space-y-2 transition-all duration-500 ${
                mode === "register" 
                  ? "opacity-100 max-h-96 translate-y-0" 
                  : "opacity-0 max-h-0 translate-y-[-10px] overflow-hidden"
              }`}>
                <Label htmlFor="fullName" className="text-gray-700 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 ${
                    formik.touched.fullName && formik.errors.fullName
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-xs text-red-600 animate-fade-in">
                    {formik.errors.fullName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-600 animate-fade-in">{formik.errors.email}</p>
              )}
            </div>

            {mode === "register" && (
              <div className={`space-y-2 transition-all duration-500 ${
                mode === "register" 
                  ? "opacity-100 max-h-96 translate-y-0" 
                  : "opacity-0 max-h-0 translate-y-[-10px] overflow-hidden"
              }`}>
                <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="0901234567"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 ${
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <p className="text-xs text-red-600 animate-fade-in">
                    {formik.errors.phoneNumber}
                  </p>
                )}
              </div>
            )}

            {mode === "register" && (
              <div className={`space-y-2 transition-all duration-500 ${
                mode === "register" 
                  ? "opacity-100 max-h-96 translate-y-0" 
                  : "opacity-0 max-h-0 translate-y-[-10px] overflow-hidden"
              }`}>
                <Label htmlFor="gender" className="text-gray-700 font-medium">Gender</Label>
                <Select
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 ${
                    formik.touched.gender && formik.errors.gender
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender (optional)</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="text-xs text-red-600 animate-fade-in">{formik.errors.gender}</p>
                )}
              </div>
            )}

            {mode === "register" && (
              <div className={`space-y-2 transition-all duration-500 ${
                mode === "register" 
                  ? "opacity-100 max-h-96 translate-y-0" 
                  : "opacity-0 max-h-0 translate-y-[-10px] overflow-hidden"
              }`}>
                <Label htmlFor="birthYear" className="text-gray-700 font-medium">
                  Birth Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  placeholder="1990"
                  value={formik.values.birthYear}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 ${
                    formik.touched.birthYear && formik.errors.birthYear
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.birthYear && formik.errors.birthYear && (
                  <p className="text-xs text-red-600 animate-fade-in">
                    {formik.errors.birthYear}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-600 animate-fade-in">{formik.errors.password}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 animate-fade-in shadow-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200 animate-fade-in shadow-sm">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg font-semibold py-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : mode === "login" ? "Login" : "Register"}
            </Button>

            {/* Forgot password link - Only show in login mode */}
            {mode === "login" && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline transition-all duration-300 hover:gap-2 flex items-center justify-center gap-1 mx-auto group"
                >
                  <span>Quên mật khẩu?</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              Demo: Use email with "staff" to access admin page
            </p>
            <p className="text-xs text-gray-500">
              Example: staff@example.com / member@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

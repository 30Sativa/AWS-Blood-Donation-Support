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

type AuthMode = "login" | "register";

const BLOOD_TYPES = [
  "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+",
];

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
  bloodType: Yup.string()
    .required("Blood type is required.")
    .oneOf(BLOOD_TYPES, "Invalid blood type."),
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
      bloodType: "",
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
          console.log("Login response:", response);

          if (response.token && response.user) {
            try {
              localStorage.setItem("token", response.token);
              sessionStorage.setItem("token", response.token);

              const userRole = response.user.email.includes("admin")
                ? "admin"
                : response.user.email.includes("staff")
                ? "staff"
                : "member";

              const userId = response.user.id;
              const userName =
                (response.user as { fullName?: string }).fullName || "";

              localStorage.setItem("role", userRole);
              localStorage.setItem("userEmail", response.user.email);
              localStorage.setItem("userName", userName);

              if (userId) {
                localStorage.setItem("userId", String(userId));
              }

              refreshAuth();
            } catch (e) {
              console.warn("Unable to save token to storage:", e);
            }
          }

          if (response.user?.email.includes("admin")) {
            navigate("/admin", { replace: true });
          } else {
            navigate("/member/dashboard", { replace: true });
          }
        } else {
          await authService.register({
            fullName: values.fullName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            gender: values.gender || undefined,
            birthYear: parseInt(values.birthYear),
            bloodType: values.bloodType,
            password: values.password,
          });
          setSuccess("Registration successful! Please login.");
          setMode("login");
          formik.resetForm();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
          Back to home
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Welcome</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Login or create an account to continue
          </p>

          <div className="flex gap-2 mb-6 border-b">
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.fullName && formik.errors.fullName
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-xs text-red-600">
                    {formik.errors.fullName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="0901234567"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <p className="text-xs text-red-600">
                    {formik.errors.phoneNumber}
                  </p>
                )}
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.gender && formik.errors.gender
                      ? "border-red-500"
                      : ""
                  }
                >
                  <option value="">Select gender (optional)</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="text-xs text-red-600">{formik.errors.gender}</p>
                )}
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="birthYear">Birth Year <span className="text-red-500">*</span></Label>
                <Input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  placeholder="1990"
                  value={formik.values.birthYear}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.birthYear && formik.errors.birthYear
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.birthYear && formik.errors.birthYear && (
                  <p className="text-xs text-red-600">
                    {formik.errors.birthYear}
                  </p>
                )}
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type <span className="text-red-500">*</span></Label>
                <Select
                  id="bloodType"
                  name="bloodType"
                  value={formik.values.bloodType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.bloodType && formik.errors.bloodType
                      ? "border-red-500"
                      : ""
                  }
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {formik.touched.bloodType && formik.errors.bloodType && (
                  <p className="text-xs text-red-600">
                    {formik.errors.bloodType}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Login"
                : "Register"}
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

          <div className="mt-6 pt-6 border-t">
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

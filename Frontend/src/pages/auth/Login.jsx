import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api"; // axios instance dùng token
import { forgotPassword, resetPassword } from "../../services/userService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loadingForgotPassword, setLoadingForgotPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  
  // Reset password states
  const [resetPasswordData, setResetPasswordData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    confirmationCode: "",
  });
  const [loadingResetPassword, setLoadingResetPassword] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setErrorMessage("");

    try {
      const res = await api.post("/Users/login", {
        email,
        password,
      });

      if (!res.data.success) {
        const message = res.data.message || "Login failed";
        setErrorMessage(message);
        
        // If email not confirmed, redirect to confirm email page
        if (message.toLowerCase().includes("email") && message.toLowerCase().includes("confirm")) {
          setTimeout(() => {
            navigate(`/confirm-email?email=${encodeURIComponent(email)}`);
          }, 2000);
        }
        
        setLoadingSubmit(false);
        return;
      }

      const data = res.data.data;

      // Gọi hàm login trong AuthContext
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        roles: data.roles,
      });

      const role = data.roles?.[0];

      // Điều hướng đúng role
      if (role === "ADMIN") navigate("/dashboard/admin");
      else if (role === "STAFF") navigate("/dashboard/staff");
      else navigate("/dashboard/member");

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Incorrect email or password";
      setErrorMessage(errorMsg);
      
      // If email not confirmed, redirect to confirm email page
      if (
        errorMsg.toLowerCase().includes("not confirmed") ||
        errorMsg.toLowerCase().includes("verify your email") ||
        errorMsg.toLowerCase().includes("email") && errorMsg.toLowerCase().includes("confirm")
      ) {
        setTimeout(() => {
          navigate(`/confirm-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    }

    setLoadingSubmit(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingForgotPassword(true);
    setForgotPasswordMessage("");

    try {
      const response = await forgotPassword(forgotPasswordEmail);
      if (response.success) {
        setForgotPasswordMessage("Password reset code has been sent to your email. Please check your inbox.");
        setTimeout(() => {
          setShowForgotPassword(false);
          setShowResetPassword(true);
          setResetPasswordData((prev) => ({
            ...prev,
            email: forgotPasswordEmail,
          }));
        }, 2000);
      } else {
        setForgotPasswordMessage(response.message || "Failed to send reset code");
      }
    } catch (err) {
      console.error("Error sending forgot password:", err);
      setForgotPasswordMessage(
        err.response?.data?.message ||
          "Failed to send reset code. Please try again."
      );
    } finally {
      setLoadingForgotPassword(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoadingResetPassword(true);
    setResetPasswordMessage("");

    // Validate passwords match
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setResetPasswordMessage("Passwords do not match");
      setLoadingResetPassword(false);
      return;
    }

    // Validate password length
    if (resetPasswordData.newPassword.length < 6) {
      setResetPasswordMessage("Password must be at least 6 characters");
      setLoadingResetPassword(false);
      return;
    }

    try {
      const response = await resetPassword(
        resetPasswordData.email,
        resetPasswordData.newPassword,
        resetPasswordData.confirmationCode
      );
      if (response.success) {
        setResetPasswordMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          setShowResetPassword(false);
          setResetPasswordData({
            email: "",
            newPassword: "",
            confirmPassword: "",
            confirmationCode: "",
          });
        }, 2000);
      } else {
        setResetPasswordMessage(response.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setResetPasswordMessage(
        err.response?.data?.message ||
          "Failed to reset password. Please check your confirmation code and try again."
      );
    } finally {
      setLoadingResetPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-md mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-red-600 transition mb-6 group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Back to homepage</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">

          {/* Blood Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-600">Log in or create an account to continue</p>
          </div>

          <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex-1 py-2.5 px-4 rounded-lg bg-white text-gray-900 font-semibold shadow-sm transition"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="flex-1 py-2.5 px-4 rounded-lg text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Register
            </button>
          </div>

          {/* 🔥 Error message */}
          {errorMessage && (
            <div className="text-red-600 text-center mb-3 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotPasswordEmail(email);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition"
            >
              {loadingSubmit ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">
              Demo: Use email with “staff” to access the management page
            </p>
            <p className="text-xs text-gray-400">
              E.g.: staff@example.com / member@example.com
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordMessage("");
                setForgotPasswordEmail("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p className="text-gray-600">Enter your email to receive a reset code</p>
            </div>

            {forgotPasswordMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                forgotPasswordMessage.includes("sent") || forgotPasswordMessage.includes("successfully")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordMessage("");
                    setForgotPasswordEmail("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingForgotPassword}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:opacity-90 transition font-semibold disabled:opacity-50"
                >
                  {loadingForgotPassword ? "Sending..." : "Send Reset Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowResetPassword(false);
                setResetPasswordMessage("");
                setResetPasswordData({
                  email: "",
                  newPassword: "",
                  confirmPassword: "",
                  confirmationCode: "",
                });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600">Enter the code from your email and your new password</p>
            </div>

            {resetPasswordMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                resetPasswordMessage.includes("successfully")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {resetPasswordMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={resetPasswordData.email}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmation Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={resetPasswordData.confirmationCode}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      confirmationCode: e.target.value,
                    }))
                  }
                  placeholder="Enter code from email"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 text-center text-xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">Check your email for the confirmation code</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPasswordData.newPassword}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordMessage("");
                    setResetPasswordData({
                      email: "",
                      newPassword: "",
                      confirmPassword: "",
                      confirmationCode: "",
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingResetPassword}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:opacity-90 transition font-semibold disabled:opacity-50"
                >
                  {loadingResetPassword ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

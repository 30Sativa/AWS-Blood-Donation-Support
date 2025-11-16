import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";
import { authService } from "@/services/authService";

type Step = "email" | "otp" | "newPassword";

const Forgotpassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.requestPasswordReset({ email });
      setSuccess(response.message || "Mã OTP đã được gửi đến email của bạn!");
      setTimeout(() => {
        setStep("otp");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.verifyOTP({ email, confirmationCode });
      setSuccess(response.message || "Xác thực mã xác nhận thành công!");
      setTimeout(() => {
        setStep("newPassword");
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Mã xác nhận không hợp lệ hoặc đã hết hạn"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        confirmationCode,
        newPassword,
      });
      setSuccess(response.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Nhập email của bạn để nhận mã OTP
              </p>
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
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </Button>
          </form>
        );

      case "otp":
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmationCode">Mã xác nhận</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmationCode"
                  type="text"
                  placeholder="Nhập mã xác nhận"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="pl-10 text-center text-lg tracking-widest"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Mã xác nhận đã được gửi đến <strong>{email}</strong>
              </p>
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("email");
                  setConfirmationCode("");
                  setError("");
                  setSuccess("");
                }}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Đang xác thực..." : "Xác thực"}
              </Button>
            </div>
          </form>
        );

      case "newPassword":
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Tối thiểu 6 ký tự</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("otp");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back to login link */}
      <div className="p-6">
        <button
          onClick={() => navigate("/auth/login")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </button>
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

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">Quên mật khẩu</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            {step === "email" && "Nhập email để nhận mã xác nhận"}
            {step === "otp" && "Nhập mã xác nhận đã được gửi đến email của bạn"}
            {step === "newPassword" && "Tạo mật khẩu mới cho tài khoản của bạn"}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "email"
                    ? "bg-red-600 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {step === "email" ? "1" : "✓"}
              </div>
              <div
                className={`w-12 h-0.5 ${
                  step === "newPassword" ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "otp"
                    ? "bg-red-600 text-white"
                    : step === "newPassword"
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step === "newPassword" ? "✓" : "2"}
              </div>
              <div
                className={`w-12 h-0.5 ${
                  step === "newPassword" ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "newPassword"
                    ? "bg-red-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Form */}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;

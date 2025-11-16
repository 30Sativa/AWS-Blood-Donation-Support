import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { Droplet, Mail, ArrowLeft } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { ref: formRef, isVisible: formVisible } = useScrollAnimation({ threshold: 0.1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.verifyOTP({
        email,
        confirmationCode,
      });

      setSuccess(response.message || "Email confirmed successfully! You can now login.");
      
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid confirmation code or code has expired"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="p-6 relative z-10">
        <button
          onClick={() => navigate("/auth/login")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:gap-3 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </button>
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
              <Mail className="w-8 h-8 text-white group-hover:animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Confirm Your Email
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            We've sent a confirmation code to your email
          </p>

          {email && (
            <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-700 text-center">
                <span className="font-semibold">Email:</span> {email}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmationCode" className="text-gray-700 font-medium">
                Confirmation Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-widest font-mono transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-300 border-gray-300"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Please check your email inbox for the confirmation code
              </p>
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
              disabled={loading || !confirmationCode}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg font-semibold py-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : "Confirm Email"}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="text-sm text-red-600 hover:text-red-700 hover:underline transition-all duration-300"
              >
                Didn't receive code? Try logging in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


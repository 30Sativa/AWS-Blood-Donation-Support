import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmail, resendConfirmationCode } from "../../services/userService";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email");

  const [formData, setFormData] = useState({
    email: emailFromUrl || "",
    verificationCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Update email when URL param changes
  useEffect(() => {
    if (emailFromUrl) {
      setFormData((prev) => ({
        ...prev,
        email: emailFromUrl,
      }));
    }
  }, [emailFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendMessage("");
    
    // Validate form before submitting
    if (!formData.email || !formData.email.trim()) {
      setError("Email address is required.");
      return;
    }
    
    if (!formData.verificationCode || !formData.verificationCode.trim()) {
      setError("Confirmation code cannot be empty.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await confirmEmail(
        formData.email.trim(),
        formData.verificationCode.trim()
      );

      console.log("Confirm email response:", response);
      console.log("Response type:", typeof response);
      console.log("Response.success:", response?.success);
      console.log("Response.message:", response?.message);

      // Check if response is successful - handle multiple response formats
      const isSuccess = response?.success === true || 
                       response?.success === "true" ||
                       (response?.message && response.message.includes("activated")) ||
                       (response?.message && response.message.includes("confirmed"));

      if (isSuccess) {
        console.log("Email confirmation successful!");
        setSuccess(true);
        setError(""); // Clear any previous errors
        setResendMessage(""); // Clear resend message
        // Clear the form
        setFormData((prev) => ({
          ...prev,
          verificationCode: "",
        }));
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Handle case where success is false or response structure is unexpected
        console.log("Email confirmation failed:", response);
        const errorMsg = response?.message || 
                        response?.error || 
                        "Invalid or expired verification code.";
        setError(errorMsg);
        setSuccess(false);
      }
    } catch (err) {
      console.error("Error confirming email:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Check if it's actually a success response but caught as error
      if (err.response?.status === 200 || err.response?.data?.success === true) {
        // This shouldn't happen, but handle it just in case
        setSuccess(true);
        setError("");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Real error - extract message from response
        const errorData = err.response?.data;
        let errorMsg = "Failed to confirm email. Please try again.";
        
        if (errorData) {
          // Try different possible error message fields
          errorMsg = errorData.message || 
                    errorData.error || 
                    errorData.Message ||
                    (typeof errorData === 'string' ? errorData : errorMsg);
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        setError(errorMsg);
        setSuccess(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError("Please enter your email address first");
      return;
    }

    setLoadingResend(true);
    setResendMessage("");
    setError("");

    try {
      const response = await resendConfirmationCode(formData.email);
      if (response.success) {
        setResendMessage("Verification code has been resent to your email. Please check your inbox.");
      } else {
        setResendMessage(response.message || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      console.error("Error resending confirmation code:", err);
      setResendMessage(
        err.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <Link
          to="/login"
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
          <span className="font-medium">Back to Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Confirm Your Email
            </h1>
            <p className="text-gray-600">
              {success
                ? "Email confirmed successfully! Redirecting to login..."
                : "Please enter the verification code sent to your email"}
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-600 font-semibold text-lg">
                Email confirmed successfully!
              </p>
              <p className="text-gray-600 mt-2">
                You will be redirected to the login page shortly...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                  {(error.toLowerCase().includes("expired") || 
                    error.toLowerCase().includes("invalid") ||
                    error.toLowerCase().includes("code")) && (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loadingResend}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline disabled:opacity-50"
                    >
                      {loadingResend ? "Resending..." : "Resend Code"}
                    </button>
                  )}
                </div>
              )}

              {/* Resend Success Message - moved to bottom section */}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Verification Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  required
                  value={formData.verificationCode}
                  onChange={handleChange}
                  placeholder="Enter verification code"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Check your email for the verification code
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold mt-6 hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Confirming..." : "Confirm Email"}
              </button>
            </form>
          )}

          {/* Help Text - Resend Code Section */}
          {!success && (
            <div className="mt-8 pt-6 border-t">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the code or code expired?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loadingResend || !formData.email}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold rounded-xl border-2 border-red-200 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50"
                >
                  {loadingResend ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Resend Verification Code</span>
                    </>
                  )}
                </button>
              </div>
              {resendMessage && (
                <div className={`mb-3 p-3 rounded-lg text-sm text-center ${
                  resendMessage.includes("resent") || resendMessage.includes("sent")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {resendMessage}
                </div>
              )}
              <p className="text-sm text-gray-500 text-center">
                or{" "}
                <Link
                  to="/login"
                  className="text-red-600 hover:text-red-700 font-medium underline"
                >
                  Try logging in again
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

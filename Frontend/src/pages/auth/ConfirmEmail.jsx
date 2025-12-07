import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmail } from "../../services/userService";

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
    setLoading(true);

    try {
      const response = await confirmEmail(
        formData.email,
        formData.verificationCode
      );

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      console.error("Error confirming email:", err);
      setError(
        err.response?.data?.message ||
          "Failed to confirm email. Please try again."
      );
    } finally {
      setLoading(false);
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
                </div>
              )}

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

          {/* Help Text */}
          {!success && (
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code?{" "}
                <Link
                  to="/login"
                  className="text-red-600 hover:text-red-700 font-medium"
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

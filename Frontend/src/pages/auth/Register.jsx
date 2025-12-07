import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api"; // axios instance

export default function Register() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
    fullName: "",
    birthYear: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "birthYear" ? parseInt(value) || "" : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const submitData = {
      ...formData,
      birthYear: parseInt(formData.birthYear) || 0,
    };

    try {
      const res = await api.post("/Users/register", submitData);

      if (!res.data.success) {
        setErrorMessage(res.data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully! Please check your email for verification code.");
      // Redirect to confirm email page with email
      setTimeout(() => {
        navigate(`/confirm-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000);

    } catch (err) {
      console.error(err);

      // backend thường trả message dạng string
      const backendMsg = err.response?.data?.message;

      if (backendMsg) {
        setErrorMessage(backendMsg);
      } else {
        setErrorMessage("Something went wrong, please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Back Button */}
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

          {/* Blood Drop Icon */}
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

          {/* Welcome */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Welcome
            </h1>
            <p className="text-gray-600">Create an account to continue</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex-1 py-2.5 px-4 rounded-lg text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="flex-1 py-2.5 px-4 rounded-lg bg-white text-gray-900 font-semibold shadow-sm transition"
            >
              Register
            </button>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="text-red-600 text-center mb-3 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="text-green-600 text-center mb-3 font-medium">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>

            {/* BirthYear + Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Birth Year <span className="text-red-600">*</span>
                </label>
                <select
                  name="birthYear"
                  required
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                >
                  <option value="">Select year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-600">*</span>
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                >
                  <option value="">Select gender</option>
                  <option value="Nam">Male</option>
                  <option value="Nữ">Female</option>
                  <option value="Khác">Other</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold mt-6"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-gray-500 mb-1">
              Demo: Use email with "staff" to access the management page
            </p>
            <p className="text-xs text-gray-400">
              E.g.: staff@example.com / member@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

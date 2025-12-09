import { useState, useEffect } from "react";
import { getMyDonor, updateDonorStatus } from "../../services/donorService";
import { useNavigate } from "react-router-dom";

export default function MemberDonor() {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyDonor();
        if (response.success && response.data) {
          setDonor(response.data);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (err) {
        console.error("Error fetching donor:", err);
        // Nếu 404 hoặc không có data, user chưa register
        if (err.response?.status === 404 || !err.response?.data?.success) {
          setIsRegistered(false);
          setError(null); // Không hiển thị error, chỉ hiển thị nút register
        } else {
          setError("Failed to load donor information");
          setIsRegistered(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonor();
  }, []);

  const handleRegisterClick = () => {
    navigate("/dashboard/member/register-donor");
  };

  const handleUpdateClick = () => {
    navigate("/dashboard/member/edit-donor");
  };

  const handleStatusToggle = async () => {
    if (!donor) return;

    try {
      const donorId = donor.donorId || donor.id;
      const newStatus = !donor.isReady;

      const response = await updateDonorStatus(donorId, newStatus);

      if (response.success) {
        // Refresh donor data
        const updatedResponse = await getMyDonor();
        if (updatedResponse.success && updatedResponse.data) {
          setDonor(updatedResponse.data);
        }
      } else {
        setError(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update status. Please try again."
      );
    }
  };

  // Format weekday number to day name
  const getWeekdayName = (weekday) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[weekday] || "Unknown";
  };

  // Format minutes to time string (HH:MM)
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">My Donor</h1>
          <p className="text-red-50 text-lg">
            {isRegistered
              ? "View and manage your donor profile information"
              : "Register as a blood donor to help save lives"}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading donor information...</p>
        </div>
      ) : !isRegistered ? (
        // Not Registered - Show Register Button
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-red-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Become a Blood Donor
            </h2>
            <p className="text-gray-600 text-lg">
              You haven't registered as a donor yet. Register now to help save lives!
            </p>
          </div>
          <button
            onClick={handleRegisterClick}
            className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Register as Donor
          </button>
        </div>
      ) : error ? (
        // Error State
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : donor ? (
        // Registered - Show Donor Information
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Full Name
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.fullName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Blood Group
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.bloodGroup || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Travel Radius
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.travelRadiusKm ? `${donor.travelRadiusKm} km` : "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Donor Status
                </label>
                <p className="mt-2">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      donor.isReady
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {donor.isReady ? "Ready to Donate" : "Not Ready"}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Email
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Phone Number
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Next Eligible Date
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.nextEligibleDate
                    ? new Date(donor.nextEligibleDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Available now"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Registered Date
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {donor.createdAt
                    ? new Date(donor.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          {donor.addressDisplay && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <p className="text-lg text-gray-900">{donor.addressDisplay}</p>
              {donor.latitude && donor.longitude && (
                <p className="text-sm text-gray-500 mt-2">
                  Coordinates: {donor.latitude.toFixed(4)}, {donor.longitude.toFixed(4)}
                </p>
              )}
            </div>
          )}

          {/* Availabilities Section */}
          {donor.availabilities && donor.availabilities.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Availability Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donor.availabilities.map((availability, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-semibold text-gray-900">
                      {getWeekdayName(availability.weekday)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatTime(availability.timeFromMin)} -{" "}
                      {formatTime(availability.timeToMin)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Conditions Section */}
          {donor.healthConditions && donor.healthConditions.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Health Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {donor.healthConditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    Condition ID: {condition.conditionId}
                    {condition.conditionName && ` - ${condition.conditionName}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Management Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Management
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Current Status
                  </p>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      donor.isReady
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {donor.isReady ? "Ready to Donate" : "Not Ready"}
                  </span>
                </div>
                <button
                  onClick={handleStatusToggle}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    donor.isReady
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {donor.isReady ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Mark as Not Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Mark as Ready
                    </span>
                  )}
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                {donor.isReady
                  ? "You are currently marked as ready to donate. Change status to update your donor information."
                  : "You are currently not ready to donate. Mark as ready when you're available for donations."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
            {!donor.isReady && (
              <button
                onClick={handleUpdateClick}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Update Donor Information
              </button>
            )}
            {donor.isReady && (
              <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed">
                Update Donor Information (Disabled - Status is Ready)
              </div>
            )}
          </div>

          {/* Last Updated */}
          {donor.updatedAt && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-right">
                Last Updated:{" "}
                <span className="font-medium text-gray-700">
                  {new Date(donor.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

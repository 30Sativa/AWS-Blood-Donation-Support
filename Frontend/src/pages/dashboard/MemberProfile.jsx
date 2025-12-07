import { useState, useEffect } from "react";
import { getUserProfile } from "../../services/userService";

export default function MemberProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Lưu userId để sử dụng sau này nếu cần (không hiển thị trên UI)
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        if (response.success) {
          setProfile(response.data);
          // Lưu userId để sử dụng sau này nếu cần
          setUserId(response.data.userId);
        } else {
          setError(response.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-red-50 text-lg">
            View and manage your account information
          </p>
        </div>
      </div>

      {/* Profile Content */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      ) : error ? (
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
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      ) : profile ? (
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Full Name
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.fullName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Email Address
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Phone Number
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.phoneNumber || "N/A"}
                </p>
                {profile.privacyPhoneVisibleToStaffOnly && (
                  <p className="text-xs text-gray-500 mt-1">
                    Phone number visible to staff only
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Birth Year
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.birthYear || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Gender
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.gender || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Role
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.roles?.join(", ") || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Account Status
                </label>
                <p className="mt-2">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      profile.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Member Since
                </label>
                <p className="text-xl font-semibold text-gray-900 mt-2">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserProfile } from "../../services/userService";
import { getMyRequests } from "../../services/requestService";

export default function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Lưu userId để sử dụng sau này nếu cần (không hiển thị trên UI)
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const profileResponse = await getUserProfile();
        if (profileResponse.success) {
          setProfile(profileResponse.data);
          setUserId(profileResponse.data.userId);
        } else {
          setError(profileResponse.message || "Failed to load profile");
        }

        // Fetch requests
        try {
          const requestsResponse = await getMyRequests();
          if (requestsResponse.success && requestsResponse.data) {
            setRequests(Array.isArray(requestsResponse.data) ? requestsResponse.data : []);
          }
        } catch (reqErr) {
          console.error("Error fetching requests:", reqErr);
          // Không set error nếu không fetch được requests, chỉ log
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Get status badge color
  const getStatusColor = (status) => {
    const statusColors = {
      MATCHING: "bg-yellow-100 text-yellow-800",
      PENDING: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency) => {
    const urgencyColors = {
      CRITICAL: "bg-red-100 text-red-800",
      HIGH: "bg-orange-100 text-orange-800",
      NORMAL: "bg-blue-100 text-blue-800",
      LOW: "bg-gray-100 text-gray-800",
    };
    return urgencyColors[urgency] || "bg-gray-100 text-gray-800";
  };

  const stats = [
    {
      title: "My Requests",
      value: requests.length.toString(),
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-red-700",
      bgColor: "bg-red-100",
      gradient: "from-red-500 to-red-600",
      link: "/dashboard/member/requests",
    },
    {
      title: "My Donor",
      value: "5",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-red-700",
      bgColor: "bg-red-100",
      gradient: "from-red-600 to-red-700",
      link: "/dashboard/member/donor",
    },
    {
      title: "Lives Saved",
      value: "15",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-red-700",
      bgColor: "bg-red-100",
      gradient: "from-red-400 to-red-500",
    },
    {
      title: "Next Donation",
      value: "30 days",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-red-700",
      bgColor: "bg-red-100",
      gradient: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-red-50 text-lg">
            Thank you for being part of our blood donation community
          </p>
        </div>
      </div>

      {/* My Profile Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.fullName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.phoneNumber || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Birth Year</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.birthYear || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.gender || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.roles?.join(", ") || "N/A"}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <p className="text-lg font-semibold mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
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

      {/* Statistical Report Section */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
              My Statistics
            </h2>
            <p className="text-gray-600 text-sm">Your donation activity overview</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => {
            const CardContent = (
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-gray-600 text-sm font-medium mb-2">
                  {stat.title}
                </div>
                <div className={`text-red-700 text-3xl font-bold leading-none`}>
                  {stat.value}
                </div>
              </div>
            );

            return stat.link ? (
              <Link
                key={index}
                to={stat.link}
                className="block h-full"
              >
                {CardContent}
              </Link>
            ) : (
              <div key={index}>{CardContent}</div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Activity
          </h2>
        </div>
        {requests.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total requests:</span>
              <span className="font-semibold text-gray-900">{requests.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Active requests:</span>
              <span className="font-semibold text-gray-900">
                {requests.filter((r) => r.status === "MATCHING" || r.status === "PENDING").length}
              </span>
            </div>
            {requests.slice(0, 3).map((request) => (
              <div
                key={request.requestId}
                className="py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/dashboard/requests/${request.requestId}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                  >
                    Request #{request.requestId}
                  </Link>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                      request.urgency
                    )}`}
                  >
                    {request.urgency}
                  </span>
                  <span>
                    Need before:{" "}
                    {request.needBeforeUtc
                      ? new Date(request.needBeforeUtc).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                {request.clinicalNotes && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {request.clinicalNotes}
                  </p>
                )}
              </div>
            ))}
            {requests.length > 3 && (
              <Link
                to="/dashboard/member/requests"
                className="block text-center text-blue-600 hover:text-blue-800 font-medium py-2"
              >
                View all requests →
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No requests yet</p>
            <Link
              to="/dashboard/member/requests/new"
              className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Create Your First Request
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/dashboard/member/requests/new"
            className="p-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 text-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create New Request
          </Link>
          <Link
            to="/dashboard/member/profile"
            className="p-5 border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-center font-semibold"
          >
            Update Profile
          </Link>
          <Link
            to="/dashboard/member/donor"
            className="p-5 border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-center font-semibold"
          >
            My Donor
          </Link>
        </div>
      </div>
    </div>
  );
}

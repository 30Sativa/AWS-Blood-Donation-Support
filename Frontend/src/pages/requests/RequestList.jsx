import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyRequests } from "../../services/requestService";
import { getBloodTypes } from "../../services/bloodTypeService";

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch requests and blood types in parallel
        const [requestsResponse, bloodTypesResponse] = await Promise.all([
          getMyRequests(),
          getBloodTypes(),
        ]);

        if (requestsResponse.success && requestsResponse.data) {
          setRequests(Array.isArray(requestsResponse.data) ? requestsResponse.data : []);
        } else {
          setError(requestsResponse.message || "Failed to load requests");
        }

        if (bloodTypesResponse.success && bloodTypesResponse.data) {
          setBloodTypes(bloodTypesResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get blood type name by ID
  const getBloodTypeName = (bloodTypeId) => {
    const bloodType = bloodTypes.find((bt) => bt.id === bloodTypeId);
    return bloodType ? bloodType.name : `ID: ${bloodTypeId}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusColors = {
      MATCHING: "bg-yellow-100 text-yellow-800",
      PENDING: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-gray-100 text-gray-800",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Requests</h1>
            <p className="text-red-50 text-lg">
              View and manage your blood donation requests
            </p>
          </div>
          <Link
            to="/dashboard/member/requests/new"
            className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
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
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Requests Yet
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            You haven't created any blood donation requests yet.
          </p>
          <Link
            to="/dashboard/member/requests/new"
            className="inline-block px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Link
              key={request.requestId}
              to={`/dashboard/requests/${request.requestId}`}
              className="block bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Request #{request.requestId}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                        request.urgency
                      )}`}
                    >
                      {request.urgency}
                    </span>
                  </div>
                  {request.clinicalNotes && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {request.clinicalNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Blood Type
                  </label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {request.bloodTypeId
                      ? getBloodTypeName(request.bloodTypeId)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Quantity
                  </label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {request.quantityUnits || 0} units
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Need Before
                  </label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {request.needBeforeUtc
                      ? new Date(request.needBeforeUtc).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Created:{" "}
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
                <span>
                  Updated:{" "}
                  {request.updatedAt
                    ? new Date(request.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

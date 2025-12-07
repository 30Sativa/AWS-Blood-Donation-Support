import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRequestById, cancelRequest } from "../../services/requestService";
import { getBloodTypes } from "../../services/bloodTypeService";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Request ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch request and blood types in parallel
        const [requestResponse, bloodTypesResponse] = await Promise.all([
          getRequestById(id),
          getBloodTypes(),
        ]);

        if (requestResponse.success && requestResponse.data) {
          setRequest(requestResponse.data);
        } else {
          setError(requestResponse.message || "Failed to load request");
        }

        if (bloodTypesResponse.success && bloodTypesResponse.data) {
          setBloodTypes(bloodTypesResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          setError("Request not found");
        } else {
          setError("Failed to load request details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCancelRequest = async () => {
    if (!id) return;

    try {
      setCancelling(true);
      const response = await cancelRequest(id);
      if (response.success) {
        // Refresh request data
        const requestResponse = await getRequestById(id);
        if (requestResponse.success && requestResponse.data) {
          setRequest(requestResponse.data);
        }
        setShowCancelConfirm(false);
        // Show success message
        alert("Request cancelled successfully");
      } else {
        alert(response.message || "Failed to cancel request");
      }
    } catch (err) {
      console.error("Error cancelling request:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel request. Please try again.";
      alert(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

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

  const canCancel = request && (request.status === "MATCHING" || request.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard/member/requests"
              className="flex items-center gap-2 text-red-50 hover:text-white transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Requests
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Request Details</h1>
          <p className="text-red-50 text-lg">
            View detailed information about your blood donation request
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/dashboard/member/requests")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Requests
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : request ? (
        <>
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            {/* Request Header Info */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Request #{request.requestId}
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getUrgencyColor(
                      request.urgency
                    )}`}
                  >
                    {request.urgency} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Main Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Request ID
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    #{request.requestId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Requester User ID
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    {request.requesterUserId || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Blood Type
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    {request.bloodTypeId
                      ? getBloodTypeName(request.bloodTypeId)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Component ID
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    {request.componentId || "N/A"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Quantity Required
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    {request.quantityUnits || 0} units
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Need Before
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    {request.needBeforeUtc
                      ? new Date(request.needBeforeUtc).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Delivery Address ID
                  </label>
                  <p className="text-xl font-semibold text-gray-900">
                    {request.deliveryAddressId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Clinical Notes Section */}
            {request.clinicalNotes && (
              <div className="mb-8 pt-8 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Clinical Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {request.clinicalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps Section */}
            <div className="pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Created At
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Last Updated
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {request.updatedAt
                      ? new Date(request.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
              <Link
                to="/dashboard/member/requests"
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold"
              >
                Back to Requests
              </Link>
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>

          {/* Cancel Confirmation Modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Cancel Request
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this request? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    disabled={cancelling}
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleCancelRequest}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

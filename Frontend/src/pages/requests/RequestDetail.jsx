import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRequestById, cancelRequest } from "../../services/requestService";
import { getBloodTypes } from "../../services/bloodTypeService";
import { searchNearbyDonors } from "../../services/donorService";
import { createMatch } from "../../services/matchService";
import { getMyDonor } from "../../services/donorService";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showNearbyDonors, setShowNearbyDonors] = useState(false);
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [searchingDonors, setSearchingDonors] = useState(false);
  const [donorSearchError, setDonorSearchError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [creatingMatch, setCreatingMatch] = useState(false);

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
          // Try to get user location from request or user's donor info
          await fetchUserLocation(requestResponse.data);
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

  // Render donor blood type with multiple fallbacks
  const getDonorBloodType = (donor) => {
    // Preferred: explicit name from API
    if (donor?.bloodTypeName) return donor.bloodTypeName.trim();

    // If API returns consolidated bloodGroup string (e.g., "O  +")
    if (donor?.bloodGroup) {
      const cleaned = donor.bloodGroup.replace(/\s+/g, "").toUpperCase();
      // Normalize forms like "O+" or "A-" etc.
      if (cleaned.length <= 3) return cleaned;
      return donor.bloodGroup.trim();
    }

    // If API returns nested bloodType object with abo/rh
    if (donor?.bloodType?.abo && donor?.bloodType?.rh) {
      return `${donor.bloodType.abo}${donor.bloodType.rh}`;
    }
    if (donor?.bloodType?.name) return donor.bloodType.name;

    // If API returns separate fields
    if (donor?.abo && donor?.rh) return `${donor.abo}${donor.rh}`;

    // Fallback to lookup by Id
    if (donor?.bloodTypeId) {
      return getBloodTypeName(donor.bloodTypeId);
    }

    return "Not specified";
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

  // Fetch user location from request or donor info
  const fetchUserLocation = async (requestData) => {
    try {
      // First, check if location is directly in request data (API returns latitude/longitude directly)
      if (requestData.latitude != null && requestData.longitude != null) {
        setUserLocation({
          latitude: requestData.latitude,
          longitude: requestData.longitude,
        });
        return;
      }

      // Check if request has requester location data
      if (requestData.requesterUser && requestData.requesterUser.latitude != null && requestData.requesterUser.longitude != null) {
        setUserLocation({
          latitude: requestData.requesterUser.latitude,
          longitude: requestData.requesterUser.longitude,
        });
        return;
      }

      // Check if request has delivery address with location
      if (requestData.deliveryAddress && requestData.deliveryAddress.latitude != null && requestData.deliveryAddress.longitude != null) {
        setUserLocation({
          latitude: requestData.deliveryAddress.latitude,
          longitude: requestData.deliveryAddress.longitude,
        });
        return;
      }

      // If not found in request, try to get from current user's donor info
      // (assuming the current user is viewing their own request)
      try {
        const donorResponse = await getMyDonor();
        if (donorResponse.success && donorResponse.data) {
          const donor = donorResponse.data;
          if (donor.latitude != null && donor.longitude != null) {
            setUserLocation({
              latitude: donor.latitude,
              longitude: donor.longitude,
            });
            return;
          }
        }
      } catch (err) {
        console.log("Could not fetch donor location:", err);
      }
    } catch (err) {
      console.error("Error fetching user location:", err);
    }
  };

  // Handle find nearby donors
  const handleFindNearbyDonors = async () => {
    const radius = parseFloat(radiusKm);
    if (Number.isNaN(radius) || radius <= 0) {
      setDonorSearchError("Please enter a valid radius (km) greater than 0.");
      setShowNearbyDonors(true);
      return;
    }

    if (!userLocation) {
      setDonorSearchError("Location information not available. Please ensure your profile has location data.");
      setShowNearbyDonors(true);
      return;
    }

    setSearchingDonors(true);
    setDonorSearchError(null);
    setShowNearbyDonors(true);

    try {
      const response = await searchNearbyDonors(
        userLocation.latitude,
        userLocation.longitude,
        radius
      );

      if (response.success && response.data) {
        setNearbyDonors(Array.isArray(response.data) ? response.data : []);
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          setDonorSearchError("No donors found within 10km radius.");
        }
      } else {
        setNearbyDonors([]);
        setDonorSearchError(response.message || "No donors found within the specified radius.");
      }
    } catch (err) {
      console.error("Error searching nearby donors:", err);
      setNearbyDonors([]);
      setDonorSearchError(
        err.response?.data?.message ||
          err.message ||
          "Failed to search nearby donors. Please try again."
      );
    } finally {
      setSearchingDonors(false);
    }
  };

  // Create match with selected donor
  const handleCreateMatch = async () => {
    if (!request || selectedDonorId == null) {
      setDonorSearchError("Please select a donor to create a match.");
      return;
    }

    const selectedDonor = nearbyDonors.find((donor, index) => {
      const donorId = donor.donorId ?? donor.id ?? index;
      return donorId === selectedDonorId;
    });

    if (!selectedDonor) {
      setDonorSearchError("Selected donor not found.");
      return;
    }

    if (
      !window.confirm(
        `Create match between Request #${request.requestId} and ${selectedDonor.fullName || "Donor"}?`
      )
    ) {
      return;
    }

    setCreatingMatch(true);
    try {
      const matchData = {
        requestId: request.requestId,
        donorId: selectedDonor.donorId ?? selectedDonor.id ?? selectedDonorId,
        compatibilityScore:
          selectedDonor.compatibilityScore != null
            ? selectedDonor.compatibilityScore
            : 0,
        distanceKm: selectedDonor.distanceKm != null ? selectedDonor.distanceKm : 0,
      };

      const response = await createMatch(matchData);

      if (response.success) {
        alert("Match created successfully!");
        setSelectedDonorId(null);
        setShowNearbyDonors(false);
      } else {
        setDonorSearchError(response.message || "Failed to create match.");
      }
    } catch (err) {
      console.error("Error creating match:", err);
      setDonorSearchError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create match. Please try again."
      );
    } finally {
      setCreatingMatch(false);
    }
  };

  // Format weekday number to day name
  const getWeekdayName = (weekday) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
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
                    Delivery Address
                  </label>
                  {request.deliveryAddressName ? (
                    <p className="text-xl font-semibold text-gray-900">
                      {request.deliveryAddressName}
                    </p>
                  ) : (
                    <p className="text-xl font-semibold text-gray-900">
                      Address ID: {request.deliveryAddressId || "N/A"}
                    </p>
                  )}
                </div>
                {/* Display coordinates if available */}
                {(request.latitude != null && request.longitude != null) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                      Location Coordinates
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Latitude, Longitude)
                    </p>
                  </div>
                )}
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
            <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4 flex-wrap">
              <Link
                to="/dashboard/member/requests"
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold"
              >
                Back to Requests
              </Link>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Search radius (km)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
              <button
                onClick={handleFindNearbyDonors}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold flex items-center gap-2"
                disabled={searchingDonors}
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {searchingDonors ? "Searching..." : "Find Nearby Donors"}
              </button>
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

          {/* Nearby Donors Modal */}
          {showNearbyDonors && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Nearby Donors
                  </h3>
                  <button
                    onClick={() => {
                      setShowNearbyDonors(false);
                      setDonorSearchError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  {/* Donor selection and create match */}
                  {nearbyDonors.length > 0 && (
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Select donor to create a match
                        </label>
                        <select
                          value={selectedDonorId ?? ""}
                          onChange={(e) =>
                            setSelectedDonorId(
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Choose a donor --</option>
                          {nearbyDonors.map((donor, index) => {
                            const donorId = donor.donorId ?? donor.id ?? index;
                            return (
                              <option key={donorId} value={donorId}>
                                {donor.fullName || "Donor"} {donor.addressDisplay ? `- ${donor.addressDisplay}` : ""} {donor.distanceKm != null ? `(${donor.distanceKm.toFixed(2)} km)` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <button
                        onClick={handleCreateMatch}
                        disabled={creatingMatch || selectedDonorId == null}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingMatch ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Match...
                          </>
                        ) : (
                          <>
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Create Match
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {searchingDonors ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                      <p className="mt-4 text-gray-600">Searching for nearby donors...</p>
                    </div>
                  ) : donorSearchError && nearbyDonors.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-600 text-lg mb-2">{donorSearchError}</p>
                      {userLocation && (
                        <p className="text-gray-500 text-sm">
                          Searching from: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)} | Radius: {parseFloat(radiusKm) || 0} km
                        </p>
                      )}
                    </div>
                  ) : nearbyDonors.length > 0 ? (
                    <>
                      <div className="mb-4 text-sm text-gray-600">
                        Found {nearbyDonors.length} donor{nearbyDonors.length !== 1 ? "s" : ""} within {parseFloat(radiusKm) || 0} km radius
                        {userLocation && (
                          <span className="ml-2 text-gray-500">
                            (from: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)} | Radius: {parseFloat(radiusKm) || 0} km)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nearbyDonors.map((donor, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                          >
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">
                                    {donor.fullName || "Anonymous Donor"}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {donor.email || "Email not available"}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    donor.isReady
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {donor.isReady ? "Ready" : "Not Ready"}
                                </span>
                              </div>

                              {/* Blood Type */}
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">
                                  Blood Type
                                </label>
                                <p className="text-lg font-semibold text-red-600 mt-1">
                                  {getDonorBloodType(donor)}
                                </p>
                              </div>

                              {/* Distance */}
                              {donor.distanceKm !== undefined && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase">
                                    Distance
                                  </label>
                                  <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {donor.distanceKm.toFixed(2)} km away
                                  </p>
                                </div>
                              )}

                              {/* Travel Radius */}
                              {donor.travelRadiusKm && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase">
                                    Travel Radius
                                  </label>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {donor.travelRadiusKm} km
                                  </p>
                                </div>
                              )}

                              {/* Address */}
                              {donor.addressDisplay && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase">
                                    Address
                                  </label>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {donor.addressDisplay}
                                  </p>
                                </div>
                              )}

                              {/* Availabilities */}
                              {donor.availabilities &&
                                donor.availabilities.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">
                                      Availability
                                    </label>
                                    <div className="mt-2 space-y-1">
                                      {donor.availabilities.slice(0, 3).map((avail, idx) => (
                                        <p key={idx} className="text-xs text-gray-600">
                                          {getWeekdayName(avail.weekday)}:{" "}
                                          {formatTime(avail.timeFromMin)} -{" "}
                                          {formatTime(avail.timeToMin)}
                                        </p>
                                      ))}
                                      {donor.availabilities.length > 3 && (
                                        <p className="text-xs text-gray-500">
                                          +{donor.availabilities.length - 3} more
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Phone Number */}
                              {donor.phoneNumber && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase">
                                    Phone
                                  </label>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {donor.phoneNumber}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

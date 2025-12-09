import { useState, useEffect } from "react";
import { getAllRequests, getRequestById } from "../../services/requestService";
import { getBloodTypes } from "../../services/bloodTypeService";
import { searchNearbyDonors } from "../../services/donorService";
import { createMatch } from "../../services/matchService";
import { useNavigate } from "react-router-dom";

export default function ManageRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNearbyDonors, setShowNearbyDonors] = useState(false);
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [searchingDonors, setSearchingDonors] = useState(false);
  const [donorSearchError, setDonorSearchError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState({ latitude: "", longitude: "" });
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [creatingMatch, setCreatingMatch] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch requests and blood types in parallel
        const [requestsResponse, bloodTypesResponse] = await Promise.all([
          getAllRequests(currentPage, pageSize),
          getBloodTypes(),
        ]);

        console.log("Requests Response:", requestsResponse);

        // Handle requests response - API returns paginated data directly
        if (requestsResponse) {
          // Check if response has pagination structure (items, totalPages, totalCount)
          if (requestsResponse.items) {
            // Direct paginated response: {items: [...], pageNumber, pageSize, totalCount, totalPages}
            setRequests(Array.isArray(requestsResponse.items) ? requestsResponse.items : []);
            setTotalPages(requestsResponse.totalPages || 1);
            setTotalItems(requestsResponse.totalCount || 0);
          } else if (requestsResponse.success && requestsResponse.data) {
            // Wrapped response: {success: true, data: {items: [...], ...}}
            if (requestsResponse.data.items) {
              setRequests(Array.isArray(requestsResponse.data.items) ? requestsResponse.data.items : []);
              setTotalPages(requestsResponse.data.totalPages || 1);
              setTotalItems(requestsResponse.data.totalCount || requestsResponse.data.totalItems || 0);
            } else if (Array.isArray(requestsResponse.data)) {
              setRequests(requestsResponse.data);
              setTotalPages(1);
              setTotalItems(requestsResponse.data.length);
            } else {
              setRequests([]);
              setTotalPages(1);
              setTotalItems(0);
            }
          } else if (Array.isArray(requestsResponse)) {
            // Direct array response
            setRequests(requestsResponse);
            setTotalPages(1);
            setTotalItems(requestsResponse.length);
          } else if (requestsResponse.success === false) {
            setError(requestsResponse.message || "Failed to load requests");
            setRequests([]);
          } else {
            setRequests([]);
            setTotalPages(1);
            setTotalItems(0);
          }
        } else {
          setError("No response from server");
          setRequests([]);
        }

        // Handle blood types response
        if (bloodTypesResponse && bloodTypesResponse.success !== false) {
          if (bloodTypesResponse.data) {
            setBloodTypes(Array.isArray(bloodTypesResponse.data) ? bloodTypesResponse.data : []);
          } else if (Array.isArray(bloodTypesResponse)) {
            setBloodTypes(bloodTypesResponse);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          data: err.response?.data,
        });
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load requests"
        );
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  // Get blood type name by ID
  const getBloodTypeName = (bloodTypeId) => {
    const bloodType = bloodTypes.find((bt) => bt.id === bloodTypeId);
    return bloodType ? bloodType.name : `ID: ${bloodTypeId}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusColors = {
      MATCHING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      PENDING: "bg-blue-100 text-blue-800 border-blue-300",
      APPROVED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      FULFILLED: "bg-green-100 text-green-800 border-green-300",
      COMPLETED: "bg-gray-100 text-gray-800 border-gray-300",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency) => {
    const urgencyColors = {
      CRITICAL: "bg-red-100 text-red-800 border-red-300",
      HIGH: "bg-orange-100 text-orange-800 border-orange-300",
      NORMAL: "bg-blue-100 text-blue-800 border-blue-300",
      LOW: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return urgencyColors[urgency] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Handle view detail
  const handleViewDetail = async (requestId) => {
    try {
      setDetailLoading(true);
      const response = await getRequestById(requestId);
      if (response.success && response.data) {
        setSelectedRequest(response.data);
        setShowDetailModal(true);
        // Try to get user location from request data
        await fetchUserLocation(response.data);
      } else {
        alert(response.message || "Failed to load request details");
      }
    } catch (err) {
      console.error("Error fetching request details:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to load request details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle view matches
  const handleViewMatches = () => {
    if (selectedRequest) {
      const requestId = selectedRequest.requestId || selectedRequest.id;
      navigate(`/dashboard/staff/matches?requestId=${requestId}`);
      setShowDetailModal(false);
    }
  };

  // Fetch user location from request data
  const fetchUserLocation = async (requestData) => {
    try {
      console.log("Request data for location:", requestData);
      
      // First, check if location is directly in request data (API returns latitude/longitude directly)
      if (requestData.latitude != null && requestData.longitude != null) {
        console.log("Found location in request data:", requestData.latitude, requestData.longitude);
        setUserLocation({
          latitude: requestData.latitude,
          longitude: requestData.longitude,
        });
        return;
      }

      // Check if request has requester location data
      if (requestData.requesterUser) {
        console.log("Requester user data:", requestData.requesterUser);
        if (requestData.requesterUser.latitude != null && requestData.requesterUser.longitude != null) {
          console.log("Found location in requester user:", requestData.requesterUser.latitude, requestData.requesterUser.longitude);
          setUserLocation({
            latitude: requestData.requesterUser.latitude,
            longitude: requestData.requesterUser.longitude,
          });
          return;
        }
        // Check if requester has donor with location
        if (requestData.requesterUser.donor && requestData.requesterUser.donor.latitude != null && requestData.requesterUser.donor.longitude != null) {
          console.log("Found location in requester donor:", requestData.requesterUser.donor.latitude, requestData.requesterUser.donor.longitude);
          setUserLocation({
            latitude: requestData.requesterUser.donor.latitude,
            longitude: requestData.requesterUser.donor.longitude,
          });
          return;
        }
      }

      // Check if request has delivery address with location
      if (requestData.deliveryAddress) {
        console.log("Delivery address data:", requestData.deliveryAddress);
        if (requestData.deliveryAddress.latitude != null && requestData.deliveryAddress.longitude != null) {
          console.log("Found location in delivery address:", requestData.deliveryAddress.latitude, requestData.deliveryAddress.longitude);
          setUserLocation({
            latitude: requestData.deliveryAddress.latitude,
            longitude: requestData.deliveryAddress.longitude,
          });
          return;
        }
        // Check if delivery address has location property (GEOGRAPHY type)
        if (requestData.deliveryAddress.location) {
          console.log("Found location property in delivery address:", requestData.deliveryAddress.location);
          // Location might be in format { lat, lng } or { latitude, longitude }
          const lat = requestData.deliveryAddress.location.lat || requestData.deliveryAddress.location.latitude;
          const lng = requestData.deliveryAddress.location.lng || requestData.deliveryAddress.location.longitude;
          if (lat != null && lng != null) {
            setUserLocation({
              latitude: lat,
              longitude: lng,
            });
            return;
          }
        }
      }

      console.log("No location found in request data");
    } catch (err) {
      console.error("Error fetching user location:", err);
    }
  };

  // Handle find nearby donors
  const handleFindNearbyDonors = async () => {
    // If no location found, try to get it from request data again
    if (!userLocation && selectedRequest) {
      console.log("No location found, trying to fetch from selected request again");
      await fetchUserLocation(selectedRequest);
    }

    // If still no location, show input form
    if (!userLocation) {
      console.log("Still no location found, showing input form");
      setShowLocationInput(true);
      setShowNearbyDonors(true);
      return;
    }

    // Use manual location if provided
    const locationToUse = showLocationInput && manualLocation.latitude && manualLocation.longitude
      ? { latitude: parseFloat(manualLocation.latitude), longitude: parseFloat(manualLocation.longitude) }
      : userLocation;

    if (!locationToUse || !locationToUse.latitude || !locationToUse.longitude) {
      setDonorSearchError("Please provide valid location coordinates.");
      setShowNearbyDonors(true);
      return;
    }

    setSearchingDonors(true);
    setDonorSearchError(null);
    setShowNearbyDonors(true);

    try {
      // Default radius of 10km, can be adjusted
      const radiusKm = 10;
      const response = await searchNearbyDonors(
        locationToUse.latitude,
        locationToUse.longitude,
        radiusKm
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

  // Handle create match
  const handleCreateMatch = async (donor) => {
    if (!selectedRequest || !donor) {
      alert("Request or donor information is missing");
      return;
    }

    if (!window.confirm(`Create match between Request #${selectedRequest.requestId} and ${donor.fullName || "Donor"}?`)) {
      return;
    }

    setCreatingMatch(true);
    try {
      const matchData = {
        requestId: selectedRequest.requestId || selectedRequest.id,
        donorId: donor.donorId || donor.id,
        compatibilityScore: donor.compatibilityScore != null ? donor.compatibilityScore : null,
        distanceKm: donor.distanceKm != null ? donor.distanceKm : 0,
      };

      const response = await createMatch(matchData);

      if (response.success) {
        alert("Match created successfully!");
        // Optionally close the modal or refresh data
        setShowNearbyDonors(false);
        setSelectedDonorId(null);
      } else {
        alert(response.message || "Failed to create match");
      }
    } catch (err) {
      console.error("Error creating match:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to create match. Please try again."
      );
    } finally {
      setCreatingMatch(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Manage Requests</h1>
          <p className="text-red-50 text-lg">
            View and manage all blood donation requests
          </p>
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
            No Requests Found
          </h2>
          <p className="text-gray-600 text-lg">
            There are no requests in the system yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-visible">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-red-50 via-red-50 to-red-100 border-b-2 border-red-200">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Requester / Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="group hover:bg-red-50/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewDetail(request.requestId)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-gray-900">
                        #{request.requestId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900 mb-1">
                          User ID: {request.requesterUserId || "N/A"}
                        </div>
                        {request.clinicalNotes && (
                          <div className="text-gray-500 text-xs truncate max-w-[200px]" title={request.clinicalNotes}>
                            {request.clinicalNotes.substring(0, 50)}
                            {request.clinicalNotes.length > 50 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-sm">
                        {request.bloodTypeId
                          ? getBloodTypeName(request.bloodTypeId)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getUrgencyColor(
                          request.urgency
                        )}`}
                      >
                        {request.urgency || "NORMAL"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {formatDate(request.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewDetail(request.requestId)}
                        disabled={detailLoading}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Stats & Pagination */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium text-sm">Total Requests:</span>
                <span className="font-bold text-gray-900 text-base">{totalItems || requests.length}</span>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Request Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-red-200 transition-colors"
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

            {/* Modal Body */}
            <div className="p-6">
              {detailLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="mt-4 text-gray-600">Loading request details...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header Section with Status and Urgency */}
                  <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Request #{selectedRequest.requestId || selectedRequest.id}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(
                            selectedRequest.status
                          )}`}
                        >
                          {selectedRequest.status || "PENDING"}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${getUrgencyColor(
                            selectedRequest.urgency
                          )}`}
                        >
                          {selectedRequest.urgency || "NORMAL"} Priority
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-300">
                          {selectedRequest.bloodTypeId
                            ? getBloodTypeName(selectedRequest.bloodTypeId)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Request ID
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          #{selectedRequest.requestId || selectedRequest.id}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Requester User ID
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRequest.requesterUserId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Blood Type
                        </label>
                        <p>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-300">
                            {selectedRequest.bloodTypeId
                              ? getBloodTypeName(selectedRequest.bloodTypeId)
                              : "N/A"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Component ID
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRequest.componentId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Quantity Required
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRequest.quantityUnits || 0} units
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Need Before (UTC)
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(selectedRequest.needBeforeUtc) || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Created At
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(selectedRequest.createdAt) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Updated At
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(selectedRequest.updatedAt) || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  {(selectedRequest.deliveryAddressName || selectedRequest.deliveryAddressId || (selectedRequest.latitude && selectedRequest.longitude)) && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                        Delivery Address
                      </label>
                      {selectedRequest.deliveryAddressName && (
                        <p className="text-base font-semibold text-gray-900 mb-2">
                          {selectedRequest.deliveryAddressName}
                        </p>
                      )}
                      {selectedRequest.deliveryAddressId && (
                        <p className="text-sm text-gray-600 mb-1">
                          Address ID: {selectedRequest.deliveryAddressId}
                        </p>
                      )}
                      {selectedRequest.latitude != null && selectedRequest.longitude != null && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
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
                          <span>
                            {selectedRequest.latitude.toFixed(6)}, {selectedRequest.longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clinical Notes Section */}
                  {selectedRequest.clinicalNotes && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                        Clinical Notes
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {selectedRequest.clinicalNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* View Matches Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleViewMatches}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      View Matches
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-between items-center">
              {selectedRequest && selectedRequest.status !== "MATCHING" && (
                <button
                  onClick={handleFindNearbyDonors}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
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
              )}
              <button
                onClick={handleCloseModal}
                className={`px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium ${selectedRequest && selectedRequest.status === "MATCHING" ? "ml-auto" : ""}`}
              >
                Close
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
                  setSelectedDonorId(null);
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
              {showLocationInput && !userLocation ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Location information not found in request data. Please enter coordinates manually:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        value={manualLocation.latitude}
                        onChange={(e) => setManualLocation({ ...manualLocation, latitude: e.target.value })}
                        placeholder="e.g., 10.762622"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        value={manualLocation.longitude}
                        onChange={(e) => setManualLocation({ ...manualLocation, longitude: e.target.value })}
                        placeholder="e.g., 106.660172"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!manualLocation.latitude || !manualLocation.longitude) {
                        setDonorSearchError("Please enter both latitude and longitude.");
                        return;
                      }
                      const lat = parseFloat(manualLocation.latitude);
                      const lng = parseFloat(manualLocation.longitude);
                      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                        setDonorSearchError("Please enter valid coordinates.");
                        return;
                      }
                      setUserLocation({ latitude: lat, longitude: lng });
                      setShowLocationInput(false);
                      setDonorSearchError(null);
                      // Now search
                      setSearchingDonors(true);
                      try {
                        const radiusKm = 10;
                        const response = await searchNearbyDonors(lat, lng, radiusKm);
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
                    }}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Search Donors
                  </button>
                  {donorSearchError && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">{donorSearchError}</p>
                    </div>
                  )}
                </div>
              ) : searchingDonors ? (
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
                  {(userLocation || (manualLocation.latitude && manualLocation.longitude)) && (
                    <p className="text-gray-500 text-sm">
                      Searching from: {(userLocation?.latitude || manualLocation.latitude).toFixed(4)}, {(userLocation?.longitude || manualLocation.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
              ) : nearbyDonors.length > 0 ? (
                <>
                  <div className="mb-4 space-y-3">
                    <div className="text-sm text-gray-600">
                      Found {nearbyDonors.length} donor{nearbyDonors.length !== 1 ? "s" : ""} within 10km radius
                      {(userLocation || (manualLocation.latitude && manualLocation.longitude)) && (
                        <span className="ml-2 text-gray-500">
                          (from: {(userLocation?.latitude || manualLocation.latitude).toFixed(4)}, {(userLocation?.longitude || manualLocation.longitude).toFixed(4)})
                        </span>
                      )}
                    </div>
                    
                    {/* Select Donor Dropdown - Show if more than 2 donors */}
                    {nearbyDonors.length > 2 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Donor to Create Match
                        </label>
                        <select
                          value={selectedDonorId !== null ? selectedDonorId : ""}
                          onChange={(e) => setSelectedDonorId(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Select a donor --</option>
                          {nearbyDonors.map((donor, index) => {
                            const donorId = donor.donorId || donor.id || index;
                            const bloodType = donor.bloodGroup || (donor.bloodTypeId ? getBloodTypeName(donor.bloodTypeId) : "");
                            return (
                              <option key={index} value={donorId}>
                                {donor.fullName || "Anonymous Donor"} 
                                {donor.distanceKm !== undefined ? ` (${donor.distanceKm.toFixed(2)} km)` : ""}
                                {bloodType ? ` - ${bloodType}` : ""}
                              </option>
                            );
                          })}
                        </select>
                        {selectedDonorId !== null && (
                          <button
                            onClick={() => {
                              const selectedDonor = nearbyDonors.find((donor, index) => {
                                const donorId = donor.donorId || donor.id || index;
                                return donorId === selectedDonorId;
                              });
                              if (selectedDonor) {
                                handleCreateMatch(selectedDonor);
                              }
                            }}
                            disabled={creatingMatch}
                            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {creatingMatch ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Match...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Match
                              </>
                            )}
                          </button>
                        )}
                      </div>
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
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900">
                                {donor.fullName || "Anonymous Donor"}
                              </h4>
                              {donor.email && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {donor.email}
                                </p>
                              )}
                              {donor.donorId && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Donor ID: {donor.donorId}
                                </p>
                              )}
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
                              {donor.bloodGroup || (donor.bloodTypeId
                                ? getBloodTypeName(donor.bloodTypeId)
                                : "Not specified")}
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

                          {/* Next Eligible Date */}
                          {donor.nextEligibleDate && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase">
                                Next Eligible Date
                              </label>
                              <p className="text-sm text-gray-700 mt-1">
                                {new Date(donor.nextEligibleDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
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

                          {/* Location Coordinates */}
                          {donor.latitude != null && donor.longitude != null && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase">
                                Location
                              </label>
                              <p className="text-xs text-gray-600 mt-1">
                                {donor.latitude.toFixed(6)}, {donor.longitude.toFixed(6)}
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

                          {/* Email */}
                          {donor.email && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase">
                                Email
                              </label>
                              <p className="text-sm text-gray-700 mt-1">
                                {donor.email}
                              </p>
                            </div>
                          )}

                          {/* Create Match Button - Show for each donor if 2 or fewer donors */}
                          {nearbyDonors.length <= 2 && (
                            <div className="pt-2 border-t border-gray-200">
                              <button
                                onClick={() => handleCreateMatch(donor)}
                                disabled={creatingMatch}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {creatingMatch ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Match...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Match
                                  </>
                                )}
                              </button>
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
    </div>
  );
}


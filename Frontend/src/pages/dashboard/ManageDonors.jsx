import { useState, useEffect } from "react";
import { getAllDonors, getDonorById } from "../../services/donorService";

export default function ManageDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const response = await getAllDonors();

        if (response.success && response.data) {
          setDonors(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || "Failed to load donors");
        }
      } catch (err) {
        console.error("Error fetching donors:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load donors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  // Convert minutes to time string (HH:MM)
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Get weekday name
  const getWeekdayName = (weekday) => {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return weekdays[weekday] || `Day ${weekday}`;
  };

  // Format availability display
  const formatAvailability = (availabilities) => {
    if (!availabilities || availabilities.length === 0) return "No availability";
    return availabilities
      .map(
        (avail) =>
          `${getWeekdayName(avail.weekday)}: ${minutesToTime(avail.timeFromMin)} - ${minutesToTime(avail.timeToMin)}`
      )
      .join(", ");
  };

  // Handle view detail
  const handleViewDetail = async (donorId) => {
    try {
      setDetailLoading(true);
      const response = await getDonorById(donorId);
      if (response.success && response.data) {
        setSelectedDonor(response.data);
        setShowDetailModal(true);
      } else {
        alert(response.message || "Failed to load donor details");
      }
    } catch (err) {
      console.error("Error fetching donor details:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to load donor details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedDonor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Manage Donors</h1>
          <p className="text-red-50 text-lg">
            View and manage all registered blood donors
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading donors...</p>
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
      ) : donors.length === 0 ? (
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
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Donors Found
          </h2>
          <p className="text-gray-600 text-lg">
            There are no registered donors in the system yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Container - No horizontal scroll */}
          <div className="overflow-x-visible">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-red-50 via-red-50 to-red-100 border-b-2 border-red-200">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Name / Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {donors.map((donor, index) => (
                  <tr
                    key={donor.donorId}
                    className="group hover:bg-red-50/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewDetail(donor.donorId)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-gray-900">
                        #{donor.donorId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900 mb-1" title={donor.fullName || "N/A"}>
                          {donor.fullName || "N/A"}
                        </div>
                        <div 
                          className="text-gray-500 text-xs" 
                          title={donor.email}
                        >
                          {donor.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {donor.phoneNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-sm">
                        {donor.bloodGroup || `ID: ${donor.bloodTypeId}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          donor.isReady
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        }`}
                      >
                        {donor.isReady ? "Ready" : "Not Ready"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewDetail(donor.donorId)}
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

          {/* Footer Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Total Donors:</span>
                <span className="font-bold text-gray-900 text-base">{donors.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Ready:</span>
                  <span className="font-bold text-green-700 text-base bg-green-100 px-3 py-1 rounded-full border border-green-300">
                    {donors.filter((d) => d.isReady).length}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Not Ready:</span>
                  <span className="font-bold text-yellow-700 text-base bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                    {donors.filter((d) => !d.isReady).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donor Detail Modal */}
      {showDetailModal && selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Donor Details</h2>
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
                  <p className="mt-4 text-gray-600">Loading donor details...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Donor ID
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        #{selectedDonor.donorId || selectedDonor.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDonor.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDonor.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDonor.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Blood Type
                      </label>
                      <p className="text-lg font-semibold text-red-600 mt-1">
                        {selectedDonor.bloodGroup ||
                          (selectedDonor.bloodTypeId
                            ? `ID: ${selectedDonor.bloodTypeId}`
                            : "N/A")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </label>
                      <p className="mt-1">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            selectedDonor.isReady
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedDonor.isReady ? "Ready" : "Not Ready"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Address
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDonor.addressDisplay ||
                          selectedDonor.fullAddress ||
                          "N/A"}
                      </p>
                      {selectedDonor.latitude && selectedDonor.longitude && (
                        <p className="text-sm text-gray-500 mt-1">
                          Coordinates: {selectedDonor.latitude.toFixed(4)},{" "}
                          {selectedDonor.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Travel Radius
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDonor.travelRadiusKm
                          ? `${selectedDonor.travelRadiusKm} km`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Next Eligible Date
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDonor.nextEligibleDate
                          ? new Date(
                              selectedDonor.nextEligibleDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Availability
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedDonor.availabilities &&
                        selectedDonor.availabilities.length > 0 ? (
                          <div className="space-y-1">
                            {selectedDonor.availabilities.map((avail, idx) => (
                              <div key={idx} className="text-sm">
                                {getWeekdayName(avail.weekday)}:{" "}
                                {minutesToTime(avail.timeFromMin)} -{" "}
                                {minutesToTime(avail.timeToMin)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No availability set</p>
                        )}
                      </div>
                    </div>
                    {selectedDonor.healthConditions &&
                      selectedDonor.healthConditions.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Health Conditions ({selectedDonor.healthConditions.length})
                          </label>
                          <div className="mt-1 space-y-1">
                            {selectedDonor.healthConditions.map((condition, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs mr-2 mb-1"
                              >
                                {condition.name || condition.healthConditionName || `Condition ${idx + 1}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

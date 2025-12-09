import { useState, useEffect } from "react";
import { searchNearbyDonors } from "../../services/donorService";
import { getBloodTypes } from "../../services/bloodTypeService";

export default function NearbyDonors() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [donors, setDonors] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchData, setSearchData] = useState({
    latitude: "",
    longitude: "",
    radiusKm: "",
  });

  useEffect(() => {
    // Fetch blood types for display
    const fetchBloodTypes = async () => {
      try {
        const response = await getBloodTypes();
        if (response.success && response.data) {
          setBloodTypes(response.data);
        }
      } catch (err) {
        console.error("Error fetching blood types:", err);
      }
    };

    fetchBloodTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const latitude = parseFloat(searchData.latitude);
      const longitude = parseFloat(searchData.longitude);
      const radiusKm = parseFloat(searchData.radiusKm);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
        setError("Please enter valid numbers for all fields");
        setLoading(false);
        return;
      }

      if (latitude < -90 || latitude > 90) {
        setError("Latitude must be between -90 and 90");
        setLoading(false);
        return;
      }

      if (longitude < -180 || longitude > 180) {
        setError("Longitude must be between -180 and 180");
        setLoading(false);
        return;
      }

      if (radiusKm <= 0) {
        setError("Radius must be greater than 0");
        setLoading(false);
        return;
      }

      const response = await searchNearbyDonors(latitude, longitude, radiusKm);

      if (response.success && response.data) {
        setDonors(Array.isArray(response.data) ? response.data : []);
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          setError(response.message || "No donors found within the specified radius.");
        }
      } else {
        setDonors([]);
        setError(response.message || "No donors found within the specified radius.");
      }
    } catch (err) {
      console.error("Error searching nearby donors:", err);
      setDonors([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to search nearby donors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get blood type name by ID
  const getBloodTypeName = (bloodTypeId) => {
    const bloodType = bloodTypes.find((bt) => bt.id === bloodTypeId);
    return bloodType ? bloodType.name : `Type ${bloodTypeId}`;
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
          <h1 className="text-3xl font-bold mb-2">Find Nearby Donors</h1>
          <p className="text-red-50 text-lg">
            Search for blood donors near your location
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Search Parameters</h2>
        {error && hasSearched && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="latitude"
                value={searchData.latitude}
                onChange={handleChange}
                required
                step="any"
                min="-90"
                max="90"
                placeholder="e.g., 10.762622"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-xs text-gray-500">Range: -90 to 90</p>
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="longitude"
                value={searchData.longitude}
                onChange={handleChange}
                required
                step="any"
                min="-180"
                max="180"
                placeholder="e.g., 106.660172"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-xs text-gray-500">Range: -180 to 180</p>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (km) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="radiusKm"
                value={searchData.radiusKm}
                onChange={handleChange}
                required
                min="0.1"
                step="0.1"
                placeholder="e.g., 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-xs text-gray-500">Search radius in kilometers</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : (
                "Search Donors"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {hasSearched && !loading && (
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Search Results {donors.length > 0 && `(${donors.length} found)`}
          </h2>

          {donors.length === 0 ? (
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
              <p className="text-gray-600 text-lg">
                No donors found within the specified radius.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try increasing the search radius or checking a different location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {donor.fullName || "Anonymous Donor"}
                        </h3>
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
                        {donor.bloodTypeId
                          ? getBloodTypeName(donor.bloodTypeId)
                          : "Not specified"}
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

                    {/* Phone Number (if visible) */}
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
          )}
        </div>
      )}
    </div>
  );
}

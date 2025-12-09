import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyDonor, updateDonor } from "../../services/donorService";
import { getBloodTypes } from "../../services/bloodTypeService";
import { getHealthConditions } from "../../services/healthConditionService";

export default function EditDonor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [donorId, setDonorId] = useState(null);
  const [donor, setDonor] = useState(null);

  const [formData, setFormData] = useState({
    bloodTypeId: "",
    travelRadiusKm: "",
    fullAddress: "",
    availabilities: [{ weekday: 0, timeFromMin: 0, timeToMin: 0 }],
    healthConditionIds: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        // Fetch donor data, blood types, and health conditions
        const [donorResponse, bloodTypesResponse, healthConditionsResponse] =
          await Promise.all([
            getMyDonor(),
            getBloodTypes(),
            getHealthConditions(),
          ]);

        if (donorResponse.success && donorResponse.data) {
          const donorData = donorResponse.data;
          setDonor(donorData);
          setDonorId(donorData.donorId || donorData.id);

          // Check if donor status is ready - if so, redirect back
          if (donorData.isReady === true) {
            setError("Cannot update donor information when status is Ready. Please mark as Not Ready first.");
            setTimeout(() => {
              navigate("/dashboard/member/donor");
            }, 3000);
            return;
          }

          // Pre-fill form with existing donor data
          setFormData({
            bloodTypeId: donorData.bloodTypeId || "",
            travelRadiusKm: donorData.travelRadiusKm || "",
            fullAddress: donorData.fullAddress || donorData.addressDisplay || "",
            availabilities:
              donorData.availabilities && donorData.availabilities.length > 0
                ? donorData.availabilities.map((avail) => ({
                    weekday: avail.weekday || 0,
                    timeFromMin: avail.timeFromMin || 0,
                    timeToMin: avail.timeToMin || 0,
                  }))
                : [{ weekday: 0, timeFromMin: 0, timeToMin: 0 }],
            healthConditionIds:
              donorData.healthConditions && donorData.healthConditions.length > 0
                ? donorData.healthConditions.map((hc) => hc.conditionId || hc.id)
                : [],
          });
        } else {
          setError("Failed to load donor information");
        }

        if (bloodTypesResponse.success && bloodTypesResponse.data) {
          setBloodTypes(bloodTypesResponse.data);
        }

        if (healthConditionsResponse.success && healthConditionsResponse.data) {
          setHealthConditions(healthConditionsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load donor information. Please try again.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "bloodTypeId" || name === "travelRadiusKm"
          ? value === "" ? 0 : parseInt(value) || 0
          : value,
    }));
  };

  const handleHealthConditionChange = (conditionId) => {
    setFormData((prev) => {
      const ids = prev.healthConditionIds || [];
      const isSelected = ids.includes(conditionId);
      return {
        ...prev,
        healthConditionIds: isSelected
          ? ids.filter((id) => id !== conditionId)
          : [...ids, conditionId],
      };
    });
  };

  const handleAvailabilityChange = (index, field, value) => {
    setFormData((prev) => {
      const newAvailabilities = [...prev.availabilities];
      newAvailabilities[index] = {
        ...newAvailabilities[index],
        [field]:
          field === "weekday" || field === "timeFromMin" || field === "timeToMin"
            ? parseInt(value) || 0
            : value,
      };
      return {
        ...prev,
        availabilities: newAvailabilities,
      };
    });
  };

  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availabilities: [
        ...prev.availabilities,
        { weekday: 0, timeFromMin: 0, timeToMin: 0 },
      ],
    }));
  };

  const removeAvailability = (index) => {
    setFormData((prev) => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!donorId) {
      setError("Donor ID is missing. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Prepare update data (no userId needed for update)
      const donorData = {
        bloodTypeId: parseInt(formData.bloodTypeId) || 0,
        travelRadiusKm: parseFloat(formData.travelRadiusKm) || 0,
        fullAddress: formData.fullAddress || "",
        availabilities: formData.availabilities.map((avail) => ({
          weekday: parseInt(avail.weekday) || 0,
          timeFromMin: parseInt(avail.timeFromMin) || 0,
          timeToMin: parseInt(avail.timeToMin) || 0,
        })),
        healthConditionIds: formData.healthConditionIds || [],
      };

      const response = await updateDonor(donorId, donorData);

      if (response.success) {
        // Navigate to donor page on success
        navigate("/dashboard/member/donor");
      } else {
        setError(response.message || "Failed to update donor information");
      }
    } catch (err) {
      console.error("Error updating donor:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update donor information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Convert minutes to time string (HH:MM)
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Convert time string (HH:MM) to minutes
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  };

  const weekdays = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading donor information...</p>
        </div>
      </div>
    );
  }

  if (error && !donor) {
    return (
      <div className="space-y-6">
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
          <Link
            to="/dashboard/member/donor"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to My Donor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard/member/donor"
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
              Back to My Donor
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Update Donor Information</h1>
          <p className="text-red-50 text-lg">
            Update your donor profile details
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type <span className="text-red-600">*</span>
            </label>
            <select
              name="bloodTypeId"
              value={formData.bloodTypeId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Blood Type</option>
              {bloodTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Radius (km) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="travelRadiusKm"
              value={formData.travelRadiusKm}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              placeholder="Enter travel radius in kilometers"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum distance you're willing to travel for donations
            </p>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address <span className="text-red-600">*</span>
            </label>
            <textarea
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter your full address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Availabilities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Availability Schedule
              </label>
              <button
                type="button"
                onClick={addAvailability}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                + Add Time Slot
              </button>
            </div>
            <div className="space-y-4">
              {formData.availabilities.map((availability, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Day
                      </label>
                      <select
                        value={availability.weekday}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "weekday",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {weekdays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        From
                      </label>
                      <input
                        type="time"
                        value={minutesToTime(availability.timeFromMin)}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "timeFromMin",
                            timeToMinutes(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        To
                      </label>
                      <input
                        type="time"
                        value={minutesToTime(availability.timeToMin)}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "timeToMin",
                            timeToMinutes(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="flex items-end">
                      {formData.availabilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAvailability(index)}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Add your available time slots for blood donations
            </p>
          </div>

          {/* Health Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Health Conditions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-lg">
              {healthConditions.map((condition) => (
                <label
                  key={condition.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.healthConditionIds.includes(condition.id)}
                    onChange={() => handleHealthConditionChange(condition.id)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {condition.name}
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        condition.isDonationEligible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {condition.isDonationEligible
                        ? "Eligible"
                        : "Not Eligible"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select any health conditions you have (if applicable)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              to="/dashboard/member/donor"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Donor Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

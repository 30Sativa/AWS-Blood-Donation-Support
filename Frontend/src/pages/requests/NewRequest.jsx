import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../../services/requestService";
import { getBloodTypes } from "../../services/bloodTypeService";
import { getUserProfile } from "../../services/userService";

export default function NewRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    requesterUserId: 0,
    urgency: "NORMAL",
    bloodTypeId: "",
    componentId: "",
    quantityUnits: "",
    needBeforeUtc: "",
    deliveryAddressId: 0,
    deliveryAddress: "",
    clinicalNotes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch blood types and user profile
        const [bloodTypesResponse, profileResponse] = await Promise.all([
          getBloodTypes(),
          getUserProfile(),
        ]);

        if (bloodTypesResponse.success && bloodTypesResponse.data) {
          setBloodTypes(bloodTypesResponse.data);
        }

        if (profileResponse.success && profileResponse.data) {
          setUserId(profileResponse.data.userId);
          setFormData((prev) => ({
            ...prev,
            requesterUserId: profileResponse.data.userId,
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantityUnits" || name === "componentId" || name === "bloodTypeId" || name === "deliveryAddressId"
        ? value === "" ? 0 : parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare request data
      const requestData = {
        requesterUserId: formData.requesterUserId || userId || 0,
        urgency: formData.urgency,
        bloodTypeId: parseInt(formData.bloodTypeId) || 0,
        componentId: parseInt(formData.componentId) || 0,
        quantityUnits: parseInt(formData.quantityUnits) || 0,
        needBeforeUtc: formData.needBeforeUtc || null,
        deliveryAddressId: parseInt(formData.deliveryAddressId) || 0,
        deliveryAddress: formData.deliveryAddress || "",
        clinicalNotes: formData.clinicalNotes || "",
      };

      const response = await registerRequest(requestData);

      if (response.success) {
        // Navigate to requests list on success
        navigate("/dashboard/member/requests");
      } else {
        setError(response.message || "Failed to create request");
      }
    } catch (err) {
      console.error("Error creating request:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get current date time in ISO format for min attribute
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
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
          <h1 className="text-3xl font-bold mb-2">Create New Request</h1>
          <p className="text-red-50 text-lg">
            Fill in the details to create a new blood donation request
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
          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency <span className="text-red-600">*</span>
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>

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

          {/* Component ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Component ID <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="componentId"
              value={formData.componentId}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter component ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the blood component ID (e.g., 1 for Whole Blood, 2 for Red Blood Cells, etc.)
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (Units) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="quantityUnits"
              value={formData.quantityUnits}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter quantity"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Need Before */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Need Before <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              name="needBeforeUtc"
              value={formData.needBeforeUtc}
              onChange={handleChange}
              required
              min={getMinDateTime()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Delivery Address ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address ID
            </label>
            <input
              type="number"
              name="deliveryAddressId"
              value={formData.deliveryAddressId}
              onChange={handleChange}
              min="0"
              placeholder="Enter delivery address ID (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address
            </label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              rows="3"
              placeholder="Enter full delivery address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Notes
            </label>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleChange}
              rows="4"
              placeholder="Enter any clinical notes or additional information"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              to="/dashboard/member/requests"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Request..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

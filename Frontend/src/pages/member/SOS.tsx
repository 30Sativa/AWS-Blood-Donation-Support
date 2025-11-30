import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Radio } from "@/components/ui/radio";
import { Droplet, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { AddressInput } from "@/components/ui/AddressInput";
import { requestService } from "@/services/requestService";
import { addressService } from "@/services/addressService";
import { profileService } from "@/services/profileService";
import type { Address } from "@/types/address";
import type { RegisterRequestRequest } from "@/types/request";

const BLOOD_TYPES = [
  { value: "1", label: "O-" },
  { value: "2", label: "O+" },
  { value: "3", label: "A-" },
  { value: "4", label: "A+" },
  { value: "5", label: "B-" },
  { value: "6", label: "B+" },
  { value: "7", label: "AB-" },
  { value: "8", label: "AB+" },
];

const BLOOD_COMPONENTS = [
  { value: "1", label: "Whole Blood" },
  { value: "2", label: "RBC" },
  { value: "3", label: "Plasma" },
  { value: "4", label: "Platelet" },
];

const URGENCY_LEVELS = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
];

export function SOS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [deliveryAddressId, setDeliveryAddressId] = useState<number | null>(null);
  const [deliveryAddressFull, setDeliveryAddressFull] = useState<string>("");
  const [deliveryAddressObject, setDeliveryAddressObject] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    bloodTypeId: "",
    componentId: "",
    quantityUnits: "",
    urgency: "Normal",
    needBeforeUtc: "",
    clinicalNotes: "",
  });

  // Load user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          // Try to get from profile
          const profile = await profileService.getCurrentUser();
          if (profile.data?.userId) {
            setUserId(profile.data.userId);
            localStorage.setItem("userId", String(profile.data.userId));
          }
        }
      } catch (err) {
        console.error("Error loading user ID:", err);
      }
    };
    loadUserId();
  }, []);

  // Không cần load address trước - user sẽ nhập address mới khi tạo request
  // Address sẽ được tạo tự động khi submit nếu chưa có addressId

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleAddressIdChange = (addressId: number | null, address: Address | null) => {
    console.log("[DEBUG] SOS handleAddressIdChange called:", { addressId, address });
    setDeliveryAddressId(addressId);
    // Lưu address object để dùng khi submit (nếu chưa có addressId)
    setDeliveryAddressObject(address);
  };

  const handleAddressFullChange = (fullAddress: string) => {
    console.log("[DEBUG] SOS handleAddressFullChange called:", fullAddress);
    setDeliveryAddressFull(fullAddress);
  };

  const convertDateTimeToISO = (dateTimeLocal: string): string => {
    // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO 8601 format (UTC)
    if (!dateTimeLocal) return "";
    // datetime-local doesn't include timezone, so we assume it's local time
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation: Không được gửi 0 hoặc missing
    if (!userId || userId <= 0) {
      setError("User ID not found. Please log in again.");
      return;
    }

    // Validate bloodTypeId
    const bloodTypeId = parseInt(formData.bloodTypeId, 10);
    if (!formData.bloodTypeId || isNaN(bloodTypeId) || bloodTypeId <= 0) {
      setError("Please select a valid blood type.");
      return;
    }

    // Validate componentId
    const componentId = parseInt(formData.componentId, 10);
    if (!formData.componentId || isNaN(componentId) || componentId <= 0) {
      setError("Please select a valid blood component.");
      return;
    }

    // Validate quantityUnits
    const quantityUnits = parseInt(formData.quantityUnits, 10);
    if (!formData.quantityUnits || isNaN(quantityUnits) || quantityUnits <= 0) {
      setError("Please enter a valid quantity (must be greater than 0).");
      return;
    }

    // Validate urgency
    if (!formData.urgency || !["Low", "Normal", "High"].includes(formData.urgency)) {
      setError("Please select a valid urgency level.");
      return;
    }

    // Validate needBeforeUtc
    if (!formData.needBeforeUtc || formData.needBeforeUtc.trim() === "") {
      setError("Please select a date and time when blood is needed.");
      return;
    }

    // Validate clinicalNotes
    if (!formData.clinicalNotes || formData.clinicalNotes.trim() === "") {
      setError("Please enter clinical notes.");
      return;
    }

    // Validate deliveryAddress - cần có fullAddress
    if (!deliveryAddressFull || !deliveryAddressFull.trim()) {
      setError("Please fill in the delivery address.");
      setLoading(false);
      return;
    }

    // Nếu có addressId thì dùng, nếu không thì gửi 0 kèm fullAddress để backend tự tạo
    // Backend có thể hỗ trợ tạo address mới khi deliveryAddressId = 0
    let finalAddressId = deliveryAddressId || 0;

    try {
      setLoading(true);
      setError("");

      // Convert date to UTC ISO format
      const needBeforeUtcISO = convertDateTimeToISO(formData.needBeforeUtc);
      if (!needBeforeUtcISO) {
        setError("Invalid date format. Please select a valid date and time.");
        setLoading(false);
        return;
      }

      const requestData: RegisterRequestRequest = {
        requesterUserId: userId,
        urgency: formData.urgency,
        bloodTypeId: bloodTypeId,
        componentId: componentId,
        quantityUnits: quantityUnits,
        needBeforeUtc: needBeforeUtcISO,
        deliveryAddressId: finalAddressId,
        clinicalNotes: formData.clinicalNotes.trim(),
      };

      // Nếu deliveryAddressId = 0 (address mới), gửi kèm fullAddress để backend tự tạo
      if (finalAddressId === 0 && deliveryAddressFull) {
        requestData.deliveryAddress = deliveryAddressFull.trim();
      }

      // Debug: log payload để kiểm tra
      console.log("[DEBUG] Request payload:", JSON.stringify(requestData, null, 2));

      const response = await requestService.registerRequest(requestData);

      if (response.success) {
        setSuccess("Blood request created successfully!");
        // Reset form
        setFormData({
          bloodTypeId: "",
          componentId: "",
          quantityUnits: "",
          urgency: "Normal",
          needBeforeUtc: "",
          clinicalNotes: "",
        });
        setDeliveryAddressId(null);
        setDeliveryAddressFull("");
        setDeliveryAddressObject(null);
      } else {
        setError(response.message || "Failed to create request");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : "") ||
        "An error occurred while creating the request";
      setError(errorMessage);
      console.error("Error creating request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Blood Requests</h1>
        <p className="text-gray-600 mt-1">Create a new blood request</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Request Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-black">Request Information</h2>
          <p className="text-gray-600 text-sm mt-1">Fill in the details for your blood request</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Type and Component */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600" />
                <Label htmlFor="bloodTypeId">
                  Blood Type<span className="text-red-600">*</span>
                </Label>
              </div>
              <Select
                id="bloodTypeId"
                value={formData.bloodTypeId}
                onChange={(e) => handleInputChange("bloodTypeId", e.target.value)}
                required
              >
                <option value="">Choose blood type</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="componentId">
                Blood Component<span className="text-red-600">*</span>
              </Label>
              <Select
                id="componentId"
                value={formData.componentId}
                onChange={(e) => handleInputChange("componentId", e.target.value)}
                required
              >
                <option value="">Choose component</option>
                {BLOOD_COMPONENTS.map((component) => (
                  <option key={component.value} value={component.value}>
                    {component.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Quantity and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantityUnits">
                Quantity Units<span className="text-red-600">*</span>
              </Label>
              <Input
                id="quantityUnits"
                type="number"
                placeholder="Enter number of units needed"
                value={formData.quantityUnits}
                onChange={(e) => handleInputChange("quantityUnits", e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <Label htmlFor="urgency">
                  Urgency Level<span className="text-red-600">*</span>
                </Label>
              </div>
              <div className="flex gap-4">
                {URGENCY_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center gap-2">
                    <Radio
                      id={`urgency-${level.value}`}
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={(e) => handleInputChange("urgency", e.target.value)}
                      required
                    />
                    <Label htmlFor={`urgency-${level.value}`} className="font-normal cursor-pointer">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Need Before Date/Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <Label htmlFor="needBeforeUtc">
                Need Before (UTC)<span className="text-red-600">*</span>
              </Label>
            </div>
            <Input
              id="needBeforeUtc"
              type="datetime-local"
              value={formData.needBeforeUtc}
              onChange={(e) => handleInputChange("needBeforeUtc", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">Select the date and time when blood is needed</p>
          </div>

          {/* Clinical Notes */}
          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">
              Clinical Notes<span className="text-red-600">*</span>
            </Label>
            <textarea
              id="clinicalNotes"
              placeholder="Additional description (e.g.: patient condition, emergency department...)"
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange("clinicalNotes", e.target.value)}
              required
              className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <Label className="text-base font-semibold">
              Delivery Address<span className="text-red-600">*</span>
            </Label>
            <AddressInput
              label=""
              value={deliveryAddressId}
              onChange={handleAddressIdChange}
              onAddressChange={handleAddressFullChange}
              required
              disableAutoLoad={true}
            />
            {!deliveryAddressFull.trim() && (
              <p className="text-xs text-red-600">
                Please fill in the delivery address
              </p>
            )}
            {deliveryAddressId && deliveryAddressFull && (
              <p className="text-xs text-gray-500">
                Delivery address: {deliveryAddressFull}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white hover:bg-red-700 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Creating Request...
                </>
              ) : (
                "Create Request"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

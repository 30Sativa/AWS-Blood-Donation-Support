import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Droplet } from "lucide-react";

const BLOOD_TYPES = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
  { value: "Rh+", label: "Rh+" },
  { value: "Rh-", label: "Rh-" },
];

const HEALTH_CONDITIONS = [
  "HIV/AIDS",
  "Hepatitis B",
  "Hepatitis C",
  "Diabetes",
  "High blood pressure",
  "Heart disease",
  "Cancer",
  "Other chronic conditions",
];

const DONATION_VOLUMES = [
  { value: "350", label: "350ml" },
  { value: "450", label: "450ml" },
];

// Mock hospitals - sẽ được thay bằng API call
const HOSPITALS = [
  { id: "1", name: "Hopital Cho Ray" },
  { id: "2", name: "Hopital Ung Buou" },
  { id: "3", name: "Bach Mai Hospital" },
  { id: "4", name: "Viet Duc Hospital" },
];

export function RegisterDonation() {
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    phone: "",
    email: "user@example.com", // Readonly - lấy từ user profile
    permanentAddress: "",
    currentAddress: "",
    bloodType: "",
    donatedBefore: false,
    preferredDate: "",
    hospitalId: "",
    bloodVolumeMl: "",
    healthConditions: [] as string[],
    notes: "",
    confirm: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHealthConditionToggle = (condition: string) => {
    setFormData((prev) => {
      const conditions = prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter((c) => c !== condition)
        : [...prev.healthConditions, condition];
      return { ...prev, healthConditions: conditions };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Donation registration submitted:", formData);
    // Handle form submission here
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Register Donation</h1>
        <p className="text-gray-600 text-lg">Fill in the information to register for blood donation</p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-lg p-10 space-y-10">
        {/* Personal Information Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Information<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                Full Name<span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                Gender<span className="text-red-600 ml-1">*</span>
              </Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number<span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="border-gray-300 bg-gray-50 cursor-not-allowed opacity-75"
              />
              <p className="text-xs text-gray-500 italic">Email is read-only (from your profile)</p>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Address<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permanentAddress" className="text-sm font-semibold text-gray-700">
                Permanent Address<span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="permanentAddress"
                placeholder="Enter permanent address"
                value={formData.permanentAddress}
                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="sameAsPermanent"
                checked={sameAsPermanent}
                onChange={(e) => {
                  setSameAsPermanent(e.target.checked);
                  if (e.target.checked) {
                    setFormData((prev) => ({
                      ...prev,
                      currentAddress: prev.permanentAddress,
                    }));
                  }
                }}
              />
              <Label htmlFor="sameAsPermanent" className="font-medium cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors">
                Same as permanent address
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAddress" className="text-sm font-semibold text-gray-700">
                Current Address
              </Label>
              <Input
                id="currentAddress"
                placeholder="Enter current address (if different)"
                value={formData.currentAddress}
                onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                disabled={sameAsPermanent}
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-50 disabled:opacity-60 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Blood Type and Donation Info Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Blood Type & Donation Information<span className="text-red-600 ml-1">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                <Label htmlFor="bloodType" className="text-sm font-semibold text-gray-700">
                  Blood Type<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Select
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
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
              <Label htmlFor="bloodVolumeMl" className="text-sm font-semibold text-gray-700">
                Donation Volume (ml)
              </Label>
              <Select
                id="bloodVolumeMl"
                value={formData.bloodVolumeMl}
                onChange={(e) => handleInputChange("bloodVolumeMl", e.target.value)}
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="">Select volume</option>
                {DONATION_VOLUMES.map((volume) => (
                  <option key={volume.value} value={volume.value}>
                    {volume.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <Label htmlFor="preferredDate" className="text-sm font-semibold text-gray-700">
                  Preferred Donation Date<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600 fill-red-600" />
                <Label htmlFor="hospitalId" className="text-sm font-semibold text-gray-700">
                  Preferred Location (Hospital)<span className="text-red-600 ml-1">*</span>
                </Label>
              </div>
              <Select
                id="hospitalId"
                value={formData.hospitalId}
                onChange={(e) => handleInputChange("hospitalId", e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="">Select hospital</option>
                {HOSPITALS.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Donated Before Checkbox */}
          <div className="flex items-center gap-3 pt-4 p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100/50 transition-colors duration-200">
            <Checkbox
              id="donatedBefore"
              checked={formData.donatedBefore}
              onChange={(e) => handleInputChange("donatedBefore", e.target.checked)}
            />
            <Label htmlFor="donatedBefore" className="font-semibold cursor-pointer text-gray-800 text-base">
              Have you donated before?<span className="text-red-600 ml-1">*</span>
            </Label>
          </div>
        </div>

        {/* Health Conditions and Notes Section */}
        <div className="space-y-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
          </div>

          {/* Health Conditions (Optional) */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Health Conditions <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                List of diseases (if any)
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 shadow-sm">
              {HEALTH_CONDITIONS.map((condition) => (
                <div key={condition} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/60 transition-colors duration-150">
                  <Checkbox
                    id={`health-${condition}`}
                    checked={formData.healthConditions.includes(condition)}
                    onChange={() => handleHealthConditionToggle(condition)}
                  />
                  <Label
                    htmlFor={`health-${condition}`}
                    className="font-medium cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <textarea
              id="notes"
              placeholder="Additional notes (e.g., taking medication, tired,...)"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              rows={4}
            />
          </div>
        </div>

        {/* Confirmation Section */}
        <div className="space-y-6 pt-6">
          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
            <Checkbox
              id="confirm"
              checked={formData.confirm}
              onChange={(e) => {
                handleInputChange("confirm", e.target.checked);
                setConfirmInfo(e.target.checked);
              }}
              className="mt-1"
            />
            <Label htmlFor="confirm" className="font-medium cursor-pointer text-gray-800 leading-relaxed text-sm">
              (<span className="text-red-600 font-bold">***</span>) I confirm that my information is accurate
              and I voluntarily donate blood under Ministry of Health regulations.
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:from-gray-300 disabled:hover:to-gray-400 py-5 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={!formData.confirm}
          >
            Register Donation
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Radio } from "@/components/ui/radio";
import { MapPin, Droplet, Calendar, AlertCircle } from "lucide-react";

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
  { value: "1", label: "Whole" },
  { value: "2", label: "RBC" },
  { value: "3", label: "Plasma" },
  { value: "4", label: "Platelet" },
];

const URGENCY_LEVELS = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
];

export function SOS() {
  const [formData, setFormData] = useState({
    // Patient Info
    patientFullName: "Nguyen Van A",
    gender: "",
    patientId: "ABC1234",
    age: "80",
    contact: "",
    departmentWard: "",
    hospital: "",
    // API Required Fields
    blood_type_id: "",
    component_id: "",
    quantity_units: "",
    urgency: "NORMAL",
    need_before_utc: "",
    delivery_address_id: "",
    clinical_notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Emergency request submitted:", formData);
    // Handle form submission here
    // Transform formData to API format
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Emergency Blood Requests</h1>
        <p className="text-gray-600 mt-1">Manage emergency blood requests that require</p>
      </div>

      {/* Enter Test Results Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-black">Enter Test Results</h2>
          <p className="text-gray-600 text-sm mt-1">Record your health check data</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientFullName">
                Patient Full Name<span className="text-red-600">*</span>
              </Label>
              <Input
                id="patientFullName"
                placeholder="Enter patient full name"
                value={formData.patientFullName}
                onChange={(e) => handleInputChange("patientFullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender<span className="text-red-600">*</span>
              </Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                required
              >
                <option value="">Please select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientId">
                Patient ID<span className="text-red-600">*</span>
              </Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID"
                value={formData.patientId}
                onChange={(e) => handleInputChange("patientId", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">
                Age<span className="text-red-600">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">
                Contact<span className="text-red-600">*</span>
              </Label>
              <Input
                id="contact"
                type="tel"
                placeholder="Enter your contact"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentWard">
                Department / Ward<span className="text-red-600">*</span>
              </Label>
              <Input
                id="departmentWard"
                placeholder="Enter your Department / Ward"
                value={formData.departmentWard}
                onChange={(e) => handleInputChange("departmentWard", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hospital">
                Hospital<span className="text-red-600">*</span>
              </Label>
              <Input
                id="hospital"
                placeholder="Enter your hospital"
                value={formData.hospital}
                onChange={(e) => handleInputChange("hospital", e.target.value)}
                required
              />
            </div>
          </div>

          {/* API Required Fields Section */}
          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Blood Request Information</h3>
            </div>

            {/* Blood Type and Component */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-600" />
                  <Label htmlFor="blood_type_id">
                    Blood Type<span className="text-red-600">*</span>
                  </Label>
                </div>
                <Select
                  id="blood_type_id"
                  value={formData.blood_type_id}
                  onChange={(e) => handleInputChange("blood_type_id", e.target.value)}
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
                <Label htmlFor="component_id">
                  Blood Component<span className="text-red-600">*</span>
                </Label>
                <Select
                  id="component_id"
                  value={formData.component_id}
                  onChange={(e) => handleInputChange("component_id", e.target.value)}
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
                <Label htmlFor="quantity_units">
                  Quantity Units<span className="text-red-600">*</span>
                </Label>
                <Input
                  id="quantity_units"
                  type="number"
                  placeholder="Enter number of units needed"
                  value={formData.quantity_units}
                  onChange={(e) => handleInputChange("quantity_units", e.target.value)}
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
                <Label htmlFor="need_before_utc">
                  Need Before (UTC)<span className="text-red-600">*</span>
                </Label>
              </div>
              <Input
                id="need_before_utc"
                type="datetime-local"
                value={formData.need_before_utc}
                onChange={(e) => handleInputChange("need_before_utc", e.target.value)}
                required
                placeholder="2025-11-05 10:00 UTC"
              />
              <p className="text-xs text-gray-500">Example: 2025-11-05 10:00 UTC</p>
            </div>

            {/* Clinical Notes */}
            <div className="space-y-2">
              <Label htmlFor="clinical_notes">
                Clinical Notes<span className="text-red-600">*</span>
              </Label>
              <textarea
                id="clinical_notes"
                placeholder="Additional description (e.g.: patient, emergency department...)"
                value={formData.clinical_notes}
                onChange={(e) => handleInputChange("clinical_notes", e.target.value)}
                required
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <Label className="text-base font-semibold">
                Delivery Address (Location)<span className="text-red-600">*</span>
              </Label>
            </div>

            <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15677.136812030332!2d106.68072368715819!3d10.789531300000013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3453f12233%3A0xe01383ba28423f9!2sAWS%20VIETNAM%20CO.%2CLTD!5e0!3m2!1svi!2s!4v1762252021859!5m2!1svi!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
              
              {/* Choose location button overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Button
                  type="button"
                  className="pointer-events-auto bg-black text-white hover:bg-gray-800 px-6 py-3 text-base font-medium"
                  onClick={() => {
                    // Handle choose location action
                    console.log("Choose location clicked");
                    // This would set delivery_address_id
                  }}
                >
                  Choose location
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-red-600 text-white hover:bg-red-700 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create Emergency Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

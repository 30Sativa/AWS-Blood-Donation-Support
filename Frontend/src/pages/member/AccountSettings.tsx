import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Droplet, Calendar, MapPin } from "lucide-react";

const BLOOD_TYPES = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

export function AccountSettings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "123 456 7890",
    bloodType: "",
    dateOfBirth: "",
    address: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Account settings updated:", formData);
    // Handle form submission here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Account settings</h1>
        <p className="text-gray-600 mt-1">Setting and changing personal information</p>
      </div>

      {/* Account Settings Form */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <Label htmlFor="name" className="text-black">
                Name<span className="text-red-600">*</span>
              </Label>
            </div>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <Label htmlFor="email" className="text-black">
                Email<span className="text-red-600">*</span>
              </Label>
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Phone and Blood Type - Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <Label htmlFor="phone" className="text-black">
                  Phone<span className="text-red-600">*</span>
                </Label>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="123 456 7890"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Blood Type Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-gray-600" />
                <Label htmlFor="bloodType" className="text-black">
                  Blood type<span className="text-red-600">*</span>
                </Label>
              </div>
              <Select
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
                required
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Choose blood type</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <Label htmlFor="dateOfBirth" className="text-black">
                Date of birth<span className="text-red-600">*</span>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="dateOfBirth"
                type="date"
                placeholder="dd/mm/yyyy"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
                className="w-full pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <Label htmlFor="address" className="text-black">
              Geolocation <span className="text-red-600">*</span>
              </Label>
            </div>
            <textarea
              id="address"
              placeholder="Enter your address..."
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700 py-3 px-8 text-base font-semibold rounded-md"
            >
              Save information
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}


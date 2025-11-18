import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { MapPin, Loader2, Search, ChevronDown } from "lucide-react";
import { addressService } from "@/services/addressService";
import { locationDataService, type Province, type District } from "@/services/locationDataService";
import type { Address, CreateAddressRequest } from "@/types/address";

interface AddressInputProps {
  label?: string;
  value?: number | null; // addressId
  onChange?: (addressId: number | null, address: Address | null) => void;
  required?: boolean;
  className?: string;
  onSaveSuccess?: (addressId: number) => void; // Callback khi lưu address thành công
}

export function AddressInput({
  label = "Address",
  value,
  onChange,
  required = false,
  className = "",
  onSaveSuccess,
}: AddressInputProps) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>("");
  const [provinceSearch, setProvinceSearch] = useState<string>("");
  const [districtSearch, setDistrictSearch] = useState<string>("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const [manualAddress, setManualAddress] = useState({
    line1: "",
    district: "",
    city: "",
    province: "",
    country: "Vietnam",
    postalCode: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const provincesData = await locationDataService.getProvinces();
        setProvinces(provincesData);
      } catch (err) {
        console.error("Error loading provinces:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province is selected
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedProvinceCode) {
        setDistricts([]);
        setSelectedDistrictCode("");
        return;
      }

      try {
        setLoadingDistricts(true);
        const districtsData = await locationDataService.getDistrictsByProvince(selectedProvinceCode);
        setDistricts(districtsData);
        
        // Update manualAddress with selected province name
        const selectedProvince = provinces.find(p => p.code === selectedProvinceCode);
        if (selectedProvince) {
          setManualAddress(prev => ({
            ...prev,
            province: selectedProvince.name,
            city: selectedProvince.name, // City và Province giống nhau ở Việt Nam
          }));
        }
      } catch (err) {
        console.error("Error loading districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedProvinceCode, provinces]);

  // Load existing address from API if addressId is provided
  useEffect(() => {
    const loadAddress = async () => {
      if (!value) {
        // Reset form if no addressId
        setSelectedAddress(null);
        setManualAddress({
          line1: "",
          district: "",
          city: "",
          province: "",
          country: "Vietnam",
          postalCode: "",
        });
        setSelectedProvinceCode("");
        setSelectedDistrictCode("");
        setDistricts([]);
        return;
      }

      try {
        setIsLoading(true);
        // Luôn load address từ API, không dùng localStorage
        const response = await addressService.getAddress(value);
        if (response.success && response.data) {
          const addressData = response.data;
          setSelectedAddress(addressData);
          setManualAddress({
            line1: addressData.line1 || "",
            district: addressData.district || "",
            city: addressData.city || "",
            province: addressData.province || "",
            country: addressData.country || "Vietnam",
            postalCode: addressData.postalCode || "",
          });

          // Match province và district sau khi provinces đã load
          if (addressData.province && provinces.length > 0) {
            const province = provinces.find(
              p => p.name === addressData.province || 
                   addressData.province?.includes(p.name) ||
                   p.name.includes(addressData.province)
            );
            if (province) {
              setSelectedProvinceCode(province.code);
              // Load districts for this province
              const districtsData = await locationDataService.getDistrictsByProvince(province.code);
              setDistricts(districtsData);
              
              // Try to find and select district by name
              if (addressData.district && districtsData.length > 0) {
                const district = districtsData.find(
                  d => d.name === addressData.district ||
                       addressData.district?.includes(d.name) ||
                       d.name.includes(addressData.district)
                );
                if (district) {
                  setSelectedDistrictCode(district.code);
                }
              }
            }
          }
        } else {
          console.error("Failed to load address:", response.message);
        }
      } catch (err) {
        console.error("Error loading address from API:", err);
        setError("Không thể tải địa chỉ từ server. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAddress();
  }, [value]); // Chỉ phụ thuộc vào value (addressId), không phụ thuộc vào provinces

  // Match province và district sau khi provinces đã load
  useEffect(() => {
    const matchProvinceAndDistrict = async () => {
      // Nếu đã có address được load và provinces đã sẵn sàng
      if (selectedAddress && selectedAddress.province && provinces.length > 0 && !selectedProvinceCode) {
        const province = provinces.find(
          p => p.name === selectedAddress.province || 
               selectedAddress.province?.includes(p.name) ||
               p.name.includes(selectedAddress.province)
        );
        if (province) {
          setSelectedProvinceCode(province.code);
          // Load districts for this province
          const districtsData = await locationDataService.getDistrictsByProvince(province.code);
          setDistricts(districtsData);
          
          // Try to find and select district by name
          if (selectedAddress.district && districtsData.length > 0) {
            const district = districtsData.find(
              d => d.name === selectedAddress.district ||
                   selectedAddress.district?.includes(d.name) ||
                   d.name.includes(selectedAddress.district)
            );
            if (district) {
              setSelectedDistrictCode(district.code);
            }
          }
        }
      }
    };

    matchProvinceAndDistrict();
  }, [provinces, selectedAddress, selectedProvinceCode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProvinceDropdown(false);
      }
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter provinces based on search
  const filteredProvinces = provinces.filter((province) =>
    province.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  // Filter districts based on search
  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const validateManualAddress = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!manualAddress.line1.trim()) {
      errors.line1 = "Địa chỉ đường/phố là bắt buộc";
    }
    if (!selectedProvinceCode) {
      errors.province = "Vui lòng chọn Tỉnh/Thành phố";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveManualAddress = async () => {
    if (!validateManualAddress()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const addressData: CreateAddressRequest = {
        ...manualAddress,
        normalizedAddress: `${manualAddress.line1}, ${manualAddress.district || ""}, ${manualAddress.city}, ${manualAddress.province}`.trim(),
      };

      let addressId: number;
      let savedAddress: Address;
      
      if (value) {
        const updateResponse = await addressService.updateAddress(value, addressData);
        if (updateResponse.success && updateResponse.data) {
          addressId = updateResponse.data.id!;
          savedAddress = updateResponse.data;
          setSelectedAddress(savedAddress);
        } else {
          throw new Error(updateResponse.message || "Failed to update address");
        }
      } else {
        const createResponse = await addressService.createAddress(addressData);
        if (createResponse.success && createResponse.data) {
          addressId = createResponse.data.id!;
          savedAddress = createResponse.data;
          setSelectedAddress(savedAddress);
        } else {
          throw new Error(createResponse.message || "Failed to create address");
        }
      }

      if (onChange) {
        onChange(addressId, savedAddress);
      }

      // Gọi callback nếu có
      if (onSaveSuccess) {
        onSaveSuccess(addressId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể lưu địa chỉ. Vui lòng thử lại.";
      setError(errorMessage);
      console.error("Error saving manual address:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="address" className="text-black">
        {label}
        {required && <span className="text-red-600">*</span>}
      </Label>

      {/* Manual Input Form */}
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="line1" className="text-sm">
              Địa chỉ đường/phố <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                id="line1"
                value={manualAddress.line1}
                onChange={(e) =>
                  setManualAddress({ ...manualAddress, line1: e.target.value })
                }
                placeholder="Số nhà, tên đường"
                className={`pl-10 ${validationErrors.line1 ? "border-red-500" : ""}`}
              />
            </div>
            {validationErrors.line1 && (
              <p className="text-xs text-red-600">{validationErrors.line1}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="province" className="text-sm">
              Tỉnh/Thành phố <span className="text-red-600">*</span>
            </Label>
            <div className="relative" ref={provinceDropdownRef}>
              <div
                className={`flex items-center border rounded-md cursor-pointer ${
                  validationErrors.province ? "border-red-500" : "border-gray-300"
                } ${loadingProvinces ? "opacity-50" : ""}`}
                onClick={() => !loadingProvinces && setShowProvinceDropdown(!showProvinceDropdown)}
              >
                <Input
                  type="text"
                  placeholder="Tìm kiếm hoặc chọn Tỉnh/Thành phố"
                  value={
                    showProvinceDropdown
                      ? provinceSearch
                      : selectedProvinceCode
                      ? provinces.find((p) => p.code === selectedProvinceCode)?.name || ""
                      : ""
                  }
                  onChange={(e) => {
                    setProvinceSearch(e.target.value);
                    setShowProvinceDropdown(true);
                  }}
                  onFocus={() => {
                    setShowProvinceDropdown(true);
                    setProvinceSearch("");
                  }}
                  className="border-0 focus:ring-0 cursor-pointer"
                  disabled={loadingProvinces}
                />
                <ChevronDown className="w-5 h-5 text-gray-400 mr-2 pointer-events-none" />
              </div>

              {showProvinceDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Tìm kiếm tỉnh/thành phố..."
                        value={provinceSearch}
                        onChange={(e) => setProvinceSearch(e.target.value)}
                        className="pl-8"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {loadingProvinces ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Đang tải...
                      </div>
                    ) : filteredProvinces.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không tìm thấy kết quả
                      </div>
                    ) : (
                      filteredProvinces.map((province) => (
                        <button
                          key={province.code}
                          type="button"
                          onClick={() => {
                            setSelectedProvinceCode(province.code);
                            setProvinceSearch("");
                            setShowProvinceDropdown(false);
                            setSelectedDistrictCode("");
                            setManualAddress((prev) => ({ ...prev, district: "" }));
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                            selectedProvinceCode === province.code ? "bg-blue-50" : ""
                          }`}
                        >
                          {province.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {validationErrors.province && (
              <p className="text-xs text-red-600">{validationErrors.province}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="district" className="text-sm">Quận/Huyện</Label>
            <div className="relative" ref={districtDropdownRef}>
              <div
                className={`flex items-center border rounded-md cursor-pointer ${
                  !selectedProvinceCode || loadingDistricts ? "opacity-50" : ""
                } border-gray-300`}
                onClick={() =>
                  selectedProvinceCode &&
                  !loadingDistricts &&
                  setShowDistrictDropdown(!showDistrictDropdown)
                }
              >
                <Input
                  type="text"
                  placeholder={
                    selectedProvinceCode
                      ? "Tìm kiếm hoặc chọn Quận/Huyện"
                      : "Vui lòng chọn Tỉnh/Thành phố trước"
                  }
                  value={
                    showDistrictDropdown
                      ? districtSearch
                      : selectedDistrictCode
                      ? districts.find((d) => d.code === selectedDistrictCode)?.name || ""
                      : ""
                  }
                  onChange={(e) => {
                    setDistrictSearch(e.target.value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => {
                    if (selectedProvinceCode) {
                      setShowDistrictDropdown(true);
                      setDistrictSearch("");
                    }
                  }}
                  className="border-0 focus:ring-0 cursor-pointer"
                  disabled={!selectedProvinceCode || loadingDistricts}
                />
                <ChevronDown className="w-5 h-5 text-gray-400 mr-2 pointer-events-none" />
              </div>

              {showDistrictDropdown && selectedProvinceCode && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Tìm kiếm quận/huyện..."
                        value={districtSearch}
                        onChange={(e) => setDistrictSearch(e.target.value)}
                        className="pl-8"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {loadingDistricts ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Đang tải...
                      </div>
                    ) : filteredDistricts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không tìm thấy kết quả
                      </div>
                    ) : (
                      filteredDistricts.map((district) => (
                        <button
                          key={district.code}
                          type="button"
                          onClick={() => {
                            setSelectedDistrictCode(district.code);
                            setDistrictSearch("");
                            setShowDistrictDropdown(false);
                            setManualAddress((prev) => ({
                              ...prev,
                              district: district.name,
                            }));
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                            selectedDistrictCode === district.code ? "bg-blue-50" : ""
                          }`}
                        >
                          {district.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="postalCode" className="text-sm">Mã bưu điện</Label>
            <Input
              id="postalCode"
              value={manualAddress.postalCode}
              onChange={(e) =>
                setManualAddress({ ...manualAddress, postalCode: e.target.value })
              }
              placeholder="Mã bưu điện"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            onClick={handleSaveManualAddress}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu địa chỉ"
            )}
          </Button>
        </div>
      </div>

      {selectedAddress && !error && (
        <div className="text-sm text-gray-600 bg-green-50 border border-green-200 p-3 rounded">
          <strong>Địa chỉ đã lưu:</strong> {selectedAddress.normalizedAddress || 
            `${selectedAddress.line1}, ${selectedAddress.district || ""}, ${selectedAddress.city}, ${selectedAddress.province}`}
        </div>
      )}
    </div>
  );
}

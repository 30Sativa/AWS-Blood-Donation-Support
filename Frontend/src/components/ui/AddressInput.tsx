import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Search, ChevronDown } from "lucide-react";
import { addressService } from "@/services/addressService";
import { locationDataService, type Province, type District } from "@/services/locationDataService";
import type { Address } from "@/types/address";

interface AddressInputProps {
  label?: string;
  value?: number | null; // addressId (deprecated, kept for backward compatibility)
  onChange?: (addressId: number | null, address: Address | null) => void;
  required?: boolean;
  className?: string;
  // New props for simple text input mode
  simpleMode?: boolean;
  onAddressChange?: (address: string) => void; // Callback when address text changes
}

// Simple Address Input Component with Province and District selects
function SimpleAddressInput({
  label,
  required,
  className,
  onAddressChange,
  onChange,
}: {
  label?: string;
  required?: boolean;
  className?: string;
  onAddressChange?: (address: string) => void;
  onChange?: (addressId: number | null, address: Address | null) => void;
}) {
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await locationDataService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province is selected
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const data = await locationDataService.getDistrictsByProvince(selectedProvince);
          setDistricts(data);
        } catch (error) {
          console.error("Error loading districts:", error);
        } finally {
          setLoadingDistricts(false);
        }
      };
      loadDistricts();
      // Reset district when province changes
      setSelectedDistrict("");
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedProvince]);

  // Use refs to store callbacks to avoid infinite loops
  const onAddressChangeRef = useRef(onAddressChange);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
    onChangeRef.current = onChange;
  }, [onAddressChange, onChange]);

  // Update full address when any part changes
  useEffect(() => {
    const parts: string[] = [];
    if (streetAddress.trim()) parts.push(streetAddress.trim());
    if (selectedDistrict) {
      const districtName = districts.find(d => d.code === selectedDistrict)?.name;
      if (districtName) parts.push(districtName);
    }
    if (selectedProvince) {
      const provinceName = provinces.find(p => p.code === selectedProvince)?.name;
      if (provinceName) parts.push(provinceName);
    }
    
    const fullAddress = parts.join(", ");
    
    if (onAddressChangeRef.current) {
      onAddressChangeRef.current(fullAddress);
    }
    if (onChangeRef.current) {
      onChangeRef.current(null, null);
    }
  }, [streetAddress, selectedProvince, selectedDistrict, provinces, districts]);

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <Label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-600">*</span>}
        </Label>
      )}
      
      {/* Street Address */}
      <div className="space-y-1">
        <Label htmlFor="street-address" className="text-sm font-semibold text-gray-700">
          Địa chỉ đường/phố {required && <span className="text-red-600">*</span>}
        </Label>
        <Input
          id="street-address"
          type="text"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="Số nhà, tên đường"
          className="w-full border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
          required={required}
        />
      </div>

      {/* Province Select */}
      <div className="space-y-1">
        <Label htmlFor="province-select" className="text-sm font-semibold text-gray-700">
          Tỉnh/Thành phố {required && <span className="text-red-600">*</span>}
        </Label>
        <select
          id="province-select"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          required={required}
          disabled={loadingProvinces}
        >
          <option value="">-- Chọn Tỉnh/Thành phố --</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Select */}
      <div className="space-y-1">
        <Label htmlFor="district-select" className="text-sm font-semibold text-gray-700">
          Quận/Huyện
        </Label>
        <select
          id="district-select"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedProvince || loadingDistricts}
        >
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function AddressInput({
  label = "Address",
  value,
  onChange,
  required = false,
  className = "",
  simpleMode = false,
  onAddressChange,
}: AddressInputProps) {
  // Nếu là simple mode, render component đơn giản - return ngay lập tức TRƯỚC KHI gọi bất kỳ hook nào
  if (simpleMode === true) {
    return (
      <SimpleAddressInput
        label={label}
        required={required}
        className={className}
        onAddressChange={onAddressChange}
        onChange={onChange}
      />
    );
  }

  // Complex mode: giữ nguyên logic cũ
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // Track xem đã load address xong chưa
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
  const onAddressChangeRef = useRef(onAddressChange);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);

  useEffect(() => {
    if (!onAddressChangeRef.current) {
      return;
    }

    const parts = [
      manualAddress.line1?.trim(),
      manualAddress.district?.trim(),
      manualAddress.city?.trim(),
      manualAddress.province?.trim(),
      manualAddress.country?.trim(),
    ].filter((part) => part && part.length > 0) as string[];

    onAddressChangeRef.current(parts.join(", "));
  }, [manualAddress]);

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

  // Load existing address from API using /api/Addresses/me
  useEffect(() => {
    const loadAddress = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Ưu tiên sử dụng endpoint /api/Addresses/me để lấy address của user hiện tại
        const response = await addressService.getMyAddress();
        
        if (response && response.success && response.data) {
          // User đã có address
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

          // Update onChange callback với addressId
          if (onChange && addressData.id) {
            onChange(addressData.id, addressData);
          }

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
                       (addressData.district && addressData.district.includes(d.name)) ||
                       (addressData.district && d.name.includes(addressData.district))
                );
                if (district) {
                  setSelectedDistrictCode(district.code);
                }
              }
            }
          }
        } else if (response === null) {
          // User chưa có address (404) - đây là trường hợp bình thường, không phải lỗi
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
          
          // Nếu có value (addressId) từ parent, thử load bằng getAddress như fallback
          if (value) {
            try {
              const fallbackResponse = await addressService.getAddress(value);
              if (fallbackResponse.success && fallbackResponse.data) {
                const addressData = fallbackResponse.data;
                setSelectedAddress(addressData);
                setManualAddress({
                  line1: addressData.line1 || "",
                  district: addressData.district || "",
                  city: addressData.city || "",
                  province: addressData.province || "",
                  country: addressData.country || "Vietnam",
                  postalCode: addressData.postalCode || "",
                });
                if (onChange && addressData.id) {
                  onChange(addressData.id, addressData);
                }
              }
            } catch (fallbackErr) {
              console.log("Fallback getAddress also failed:", fallbackErr);
            }
          }
        }
      } catch (err: any) {
        // Chỉ hiển thị error nếu không phải 404 (user chưa có address)
        if (err.response?.status !== 404) {
          console.error("Error loading address from API:", err);
          setError("Không thể tải địa chỉ từ server. Vui lòng thử lại.");
        } else {
          // 404 là bình thường - user chưa có address
          setSelectedAddress(null);
          setManualAddress({
            line1: "",
            district: "",
            city: "",
            province: "",
            country: "Vietnam",
            postalCode: "",
          });
        }
      } finally {
        setIsLoading(false);
        setHasLoaded(true); // Đánh dấu đã load xong
      }
    };

    loadAddress();
  }, []); // Chỉ chạy một lần khi component mount, không phụ thuộc vào value

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
                   (selectedAddress.district && selectedAddress.district.includes(d.name)) ||
                   (selectedAddress.district && d.name.includes(selectedAddress.district))
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

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <Label htmlFor="address" className="text-black">
          {label}
          {required && <span className="text-red-600">*</span>}
        </Label>
      )}

      {/* Form địa chỉ luôn hiển thị sau khi đã load xong (dùng để tạo hoặc cập nhật địa chỉ) */}
      {hasLoaded && !isLoading && (
        <>

          {/* Manual Input Form - tạo mới hoặc cập nhật địa chỉ */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="line1" className="text-sm font-semibold text-gray-700">
                  Địa chỉ đường/phố <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="line1"
                  value={manualAddress.line1}
                  onChange={(e) =>
                    setManualAddress({ ...manualAddress, line1: e.target.value })
                  }
                  placeholder="Số nhà, tên đường"
                  className={`border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 ${validationErrors.line1 ? "border-red-500" : ""}`}
                />
                {validationErrors.line1 && (
                  <p className="text-xs text-red-600">{validationErrors.line1}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="province" className="text-sm font-semibold text-gray-700">
                  Tỉnh/Thành phố <span className="text-red-600">*</span>
                </Label>
                <div className="relative" ref={provinceDropdownRef}>
                  <div
                    className={`flex items-center border rounded-md cursor-pointer focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
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
                <Label htmlFor="district" className="text-sm font-semibold text-gray-700">Quận/Huyện</Label>
                <div className="relative" ref={districtDropdownRef}>
                  <div
                    className={`flex items-center border rounded-md cursor-pointer focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
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

              {/* Removed postal code field as per user request */}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// src/components/ui/DonorManagement.tsx
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";
import { Select } from "./select";
import { Checkbox } from "./checkbox";
import { Heart, Loader2, AlertCircle } from "lucide-react";
import { donorService } from "@/services/donorService";
import { AddressInput } from "./AddressInput";
import type {
  Donor,
  RegisterDonorRequest,
  UpdateDonorRequest,
  Availability,
  BloodType,
  HealthCondition,
} from "@/types/donor";

interface DonorManagementProps {
  userId: number;
  addressId: number | null;
  onAddressChange?: (addressId: number | null) => void;
}

const WEEKDAYS = [
  { value: 0, label: "Chủ nhật" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

export function DonorManagement({
  userId,
  addressId,
  onAddressChange,
}: DonorManagementProps) {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDonor, setLoadingDonor] = useState(true);
  const [loadingReference, setLoadingReference] = useState(true);
  const [error, setError] = useState("");
  const [referenceError, setReferenceError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    []
  );

  // Form state
  const [formData, setFormData] = useState({
    bloodTypeId: 0,
    addressId: addressId || 0,
    travelRadiusKm: 10,
    isReady: false,
    nextEligibleDate: "",
    availabilities: [] as Availability[],
    healthConditionIds: [] as number[],
  });

  // Load reference data (blood types, health conditions)
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingReference(true);
        setReferenceError("");
        const [bloodTypeList, healthConditionList] = await Promise.all([
          donorService.getBloodTypes(),
          donorService.getHealthConditions(),
        ]);
        
        // Sort blood types by code for better UX
        const sortedBloodTypes = [...bloodTypeList].sort((a, b) => {
          const order = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
          const indexA = order.indexOf(a.code);
          const indexB = order.indexOf(b.code);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        
        setBloodTypes(sortedBloodTypes);
        setHealthConditions(healthConditionList);
      } catch (err: any) {
        console.error("Error loading reference data:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Không thể tải dữ liệu";
        setReferenceError(
          `Không thể tải danh sách nhóm máu hoặc tình trạng sức khỏe: ${errorMessage}`
        );
      } finally {
        setLoadingReference(false);
      }
    };

    loadReferenceData();
  }, []);

  // Load donor info
  useEffect(() => {
    const loadDonor = async () => {
      try {
        setLoadingDonor(true);
        setError("");
        // Thử getMyDonor trước, nếu không được thì thử getDonorByUserId
        let response = await donorService.getMyDonor();
        
        // Nếu getMyDonor trả về null, thử dùng userId để lấy
        if (!response && userId) {
          console.log("[DEBUG] DonorManagement: getMyDonor returned null, trying getDonorByUserId with userId:", userId);
          response = await donorService.getDonorByUserId(userId);
        }
        if (response && response.success && response.data) {
          const donorData = response.data;
          setDonor(donorData);
          
          // Map healthConditions array to healthConditionIds array
          const healthConditionIds = donorData.healthConditions
            ? donorData.healthConditions.map(hc => hc.conditionId)
            : (donorData.healthConditionIds || []);
          
          setFormData({
            bloodTypeId: donorData.bloodTypeId || 0,
            addressId: donorData.addressId || addressId || 0,
            travelRadiusKm: donorData.travelRadiusKm || donorData.travelRadiuskm || 10,
            isReady: donorData.isReady || false,
            nextEligibleDate: donorData.nextEligibleDate || "",
            availabilities: donorData.availabilities || [],
            healthConditionIds: healthConditionIds,
          });
          setIsRegistering(false);
        } else {
          // User chưa đăng ký làm donor
          setDonor(null);
          setIsRegistering(true);
        }
      } catch (err) {
        console.error("Error loading donor:", err);
        setError("Không thể tải thông tin donor. Vui lòng thử lại.");
      } finally {
        setLoadingDonor(false);
      }
    };

    if (userId) {
      loadDonor();
    }
  }, [userId, addressId]);

  const handleRegister = async () => {
    if (!formData.addressId) {
      setError("Vui lòng thêm địa chỉ trước khi đăng ký làm donor.");
      return;
    }
    if (!formData.bloodTypeId) {
      setError("Vui lòng chọn nhóm máu.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const registerData: RegisterDonorRequest = {
        userId,
        bloodTypeId: formData.bloodTypeId,
        addressId: formData.addressId,
        travelRadiusKm: formData.travelRadiusKm,
        isReady: formData.isReady,
        nextEligibleDate: formData.nextEligibleDate || undefined,
        availabilities: formData.availabilities.length > 0 ? formData.availabilities : undefined,
        healthConditionIds: formData.healthConditionIds.length > 0 ? formData.healthConditionIds : undefined,
      };

      const response = await donorService.registerDonor(registerData);
      if (response.success && response.data) {
        setDonor(response.data);
        setIsRegistering(false);
        setSuccess("Đăng ký làm donor thành công!");
      } else {
        setError(response.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng ký donor";
      setError(errorMessage);
      console.error("Error registering donor:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!donor?.id) {
      setError("Không tìm thấy thông tin donor");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updateData: UpdateDonorRequest = {
        bloodTypeId: formData.bloodTypeId || undefined,
        addressId: formData.addressId || undefined,
        travelRadiusKm: formData.travelRadiusKm,
        isReady: formData.isReady,
        nextEligibleDate: formData.nextEligibleDate || undefined,
        availabilities: formData.availabilities.length > 0 ? formData.availabilities : undefined,
        healthConditionIds: formData.healthConditionIds.length > 0 ? formData.healthConditionIds : undefined,
      };

      const response = await donorService.updateMyDonor(updateData);
      if (response.success && response.data) {
        setDonor(response.data);
        setSuccess("Cập nhật thông tin donor thành công!");
      } else {
        setError(response.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật donor";
      setError(errorMessage);
      console.error("Error updating donor:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReadyStatus = async () => {
    const donorId = donor?.donorId || donor?.id;
    if (!donorId) return;

    try {
      setLoading(true);
      setError("");
      const newReadyStatus = !formData.isReady;
      const response = await donorService.updateReadyStatus(donorId, {
        donorId: donorId,
        isReady: newReadyStatus,
      });
      if (response.success && response.data) {
        setDonor(response.data);
        setFormData((prev) => ({ ...prev, isReady: newReadyStatus }));
        setSuccess(`Đã ${newReadyStatus ? "bật" : "tắt"} trạng thái sẵn sàng hiến máu`);
      }
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDonor || loadingReference) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">
          Đang tải thông tin donor và dữ liệu cần thiết...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {referenceError && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-md text-sm">
          {referenceError}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {success}
        </div>
      )}

      {donor ? (
        // Đã đăng ký làm donor - hiển thị thông tin và form update
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              <strong>Bạn đã đăng ký làm donor</strong>
            </div>
            <p className="mt-1 text-sm">
              Trạng thái: {donor.isReady ? (
                <span className="text-green-700 font-semibold">Sẵn sàng hiến máu</span>
              ) : (
                <span className="text-gray-600">Chưa sẵn sàng</span>
              )}
            </p>
          </div>

          {/* Display donor information from API */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Thông tin Donor:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {donor.fullName && (
                <div>
                  <span className="text-blue-700 font-medium">Họ tên:</span>{" "}
                  <span className="text-blue-900">{donor.fullName}</span>
                </div>
              )}
              {donor.bloodGroup && (
                <div>
                  <span className="text-blue-700 font-medium">Nhóm máu:</span>{" "}
                  <span className="text-blue-900">{donor.bloodGroup}</span>
                </div>
              )}
              {donor.phoneNumber && (
                <div>
                  <span className="text-blue-700 font-medium">Số điện thoại:</span>{" "}
                  <span className="text-blue-900">{donor.phoneNumber}</span>
                </div>
              )}
              {donor.email && (
                <div>
                  <span className="text-blue-700 font-medium">Email:</span>{" "}
                  <span className="text-blue-900">{donor.email}</span>
                </div>
              )}
              {donor.addressDisplay && (
                <div className="md:col-span-2">
                  <span className="text-blue-700 font-medium">Địa chỉ:</span>{" "}
                  <span className="text-blue-900">{donor.addressDisplay}</span>
                </div>
              )}
              <div>
                <span className="text-blue-700 font-medium">Bán kính di chuyển:</span>{" "}
                <span className="text-blue-900">
                  {donor.travelRadiusKm || donor.travelRadiuskm || 0} km
                </span>
              </div>
              {donor.nextEligibleDate && (
                <div>
                  <span className="text-blue-700 font-medium">Ngày có thể hiến tiếp:</span>{" "}
                  <span className="text-blue-900">
                    {new Date(donor.nextEligibleDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-black">
                  Nhóm máu <span className="text-red-600">*</span>
                </Label>
                <Select
                  id="bloodType"
                  value={formData.bloodTypeId}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodTypeId: Number(e.target.value) })
                  }
                  className="w-full"
                >
                  <option value="0">Chọn nhóm máu</option>
                  {bloodTypes.map((bt) => {
                    const displayText = bt.name && bt.name.trim() && bt.name !== bt.code 
                      ? `${bt.code} (${bt.name})` 
                      : bt.code;
                    return (
                      <option key={bt.id} value={bt.id}>
                        {displayText}
                      </option>
                    );
                  })}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelRadius" className="text-black">
                  Bán kính di chuyển (km)
                </Label>
                <Input
                  id="travelRadius"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.travelRadiusKm}
                  onChange={(e) =>
                    setFormData({ ...formData, travelRadiusKm: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextEligibleDate" className="text-black">
                  Ngày có thể hiến máu tiếp theo
                </Label>
                <Input
                  id="nextEligibleDate"
                  type="date"
                  value={formData.nextEligibleDate}
                  onChange={(e) =>
                    setFormData({ ...formData, nextEligibleDate: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2 flex items-center">
                <Checkbox
                  id="isReady"
                  checked={formData.isReady}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isReady: checked === true })
                  }
                />
                <Label htmlFor="isReady" className="ml-2 cursor-pointer">
                  Sẵn sàng hiến máu
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black">Địa chỉ</Label>
              <AddressInput
                value={formData.addressId || null}
                onChange={(newAddressId) => {
                  setFormData({ ...formData, addressId: newAddressId || 0 });
                  if (onAddressChange) {
                    onAddressChange(newAddressId);
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black">Tình trạng sức khỏe</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {healthConditions.map((hc) => (
                  <div key={hc.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`health-${hc.id}`}
                      checked={formData.healthConditionIds.includes(hc.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            healthConditionIds: [...formData.healthConditionIds, hc.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            healthConditionIds: formData.healthConditionIds.filter(
                              (id) => id !== hc.id
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`health-${hc.id}`} className="text-sm cursor-pointer">
                      {hc.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật thông tin"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Chưa đăng ký làm donor - hiển thị form đăng ký
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <strong>Bạn chưa đăng ký làm donor</strong>
            </div>
            <p className="mt-1 text-sm">
              Đăng ký làm donor để có thể tham gia hiến máu và giúp đỡ những người cần máu.
            </p>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="register-bloodType" className="text-black">
                  Nhóm máu <span className="text-red-600">*</span>
                </Label>
                <Select
                  id="register-bloodType"
                  value={formData.bloodTypeId}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodTypeId: Number(e.target.value) })
                  }
                  className="w-full"
                >
                  <option value="0">Chọn nhóm máu</option>
                  {bloodTypes.map((bt) => {
                    const displayText = bt.name && bt.name.trim() && bt.name !== bt.code 
                      ? `${bt.code} (${bt.name})` 
                      : bt.code;
                    return (
                      <option key={bt.id} value={bt.id}>
                        {displayText}
                      </option>
                    );
                  })}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-travelRadius" className="text-black">
                  Bán kính di chuyển (km)
                </Label>
                <Input
                  id="register-travelRadius"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.travelRadiusKm}
                  onChange={(e) =>
                    setFormData({ ...formData, travelRadiusKm: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-nextEligibleDate" className="text-black">
                  Ngày có thể hiến máu tiếp theo
                </Label>
                <Input
                  id="register-nextEligibleDate"
                  type="date"
                  value={formData.nextEligibleDate}
                  onChange={(e) =>
                    setFormData({ ...formData, nextEligibleDate: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2 flex items-center">
                <Checkbox
                  id="register-isReady"
                  checked={formData.isReady}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isReady: checked === true })
                  }
                />
                <Label htmlFor="register-isReady" className="ml-2 cursor-pointer">
                  Sẵn sàng hiến máu ngay
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black">
                Địa chỉ <span className="text-red-600">*</span>
              </Label>
              <AddressInput
                value={formData.addressId || null}
                onChange={(newAddressId) => {
                  setFormData({ ...formData, addressId: newAddressId || 0 });
                  if (onAddressChange) {
                    onAddressChange(newAddressId);
                  }
                }}
                className="w-full"
              />
              {!formData.addressId && (
                <p className="text-xs text-red-600">
                  Vui lòng thêm địa chỉ trước khi đăng ký làm donor
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-black">Tình trạng sức khỏe</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {healthConditions.map((hc) => (
                  <div key={hc.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`register-health-${hc.id}`}
                      checked={formData.healthConditionIds.includes(hc.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            healthConditionIds: [...formData.healthConditionIds, hc.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            healthConditionIds: formData.healthConditionIds.filter(
                              (id) => id !== hc.id
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`register-health-${hc.id}`} className="text-sm cursor-pointer">
                      {hc.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={handleRegister}
                disabled={loading || !formData.addressId || !formData.bloodTypeId}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký làm donor"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


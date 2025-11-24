// src/components/ui/DonorManagement.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
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

function formatMinutesToTime(minutes?: number) {
  if (minutes === undefined || minutes === null) {
    return "";
  }
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor(minutes % 60)
    .toString()
    .padStart(2, "0");
  return `${hrs}:${mins}`;
}

function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return 0;
  }
  return h * 60 + m;
}

interface DonorFormState {
  bloodTypeId: number;
  addressId: number;
  travelRadiusKm: number;
  isReady: boolean;
  nextEligibleDate: string;
  availabilities: Availability[];
  healthConditionIds: number[];
  selectedWeekdays: number[];
  timeFrom: string;
  timeTo: string;
}

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
  const [readyStatusLoading, setReadyStatusLoading] = useState(false);
  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    []
  );

  // Form state
  const [formData, setFormData] = useState<DonorFormState>({
    bloodTypeId: 0,
    addressId: addressId || 0,
    travelRadiusKm: 10,
    isReady: false,
    nextEligibleDate: "",
    availabilities: [] as Availability[],
    healthConditionIds: [] as number[],
    selectedWeekdays: [] as number[],
    timeFrom: "08:00",
    timeTo: "17:00",
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

  const loadDonor = useCallback(
    async (options: { showSpinner?: boolean } = {}) => {
      if (!userId) return;
      const { showSpinner = true } = options;
      try {
        if (showSpinner) {
          setLoadingDonor(true);
        }
        setError("");
        let response = await donorService.getMyDonor();

        if (!response && userId) {
          console.log(
            "[DEBUG] DonorManagement: getMyDonor returned null, trying getDonorByUserId with userId:",
            userId
          );
          response = await donorService.getDonorByUserId(userId);
        }
        if (response && response.success && response.data) {
          const donorData = response.data;
          setDonor(donorData);

          const healthConditionIds = donorData.healthConditions
            ? donorData.healthConditions.map((hc) => hc.conditionId)
            : donorData.healthConditionIds || [];

          const uniqueWeekdays = donorData.availabilities
            ? Array.from(new Set(donorData.availabilities.map((slot) => slot.weekday)))
            : [];
          const firstSlot = donorData.availabilities?.[0];

          setFormData({
            bloodTypeId: donorData.bloodTypeId || 0,
            addressId: donorData.addressId || addressId || 0,
            travelRadiusKm: donorData.travelRadiusKm || donorData.travelRadiuskm || 10,
            isReady: donorData.isReady || false,
            nextEligibleDate: donorData.nextEligibleDate || "",
            availabilities: donorData.availabilities || [],
            healthConditionIds,
            selectedWeekdays: uniqueWeekdays,
            timeFrom: firstSlot ? formatMinutesToTime(firstSlot.timeFromMin) : "08:00",
            timeTo: firstSlot ? formatMinutesToTime(firstSlot.timeToMin) : "17:00",
          });
        } else {
          setDonor(null);
        }
      } catch (err) {
        console.error("Error loading donor:", err);
        setError("Không thể tải thông tin donor. Vui lòng thử lại.");
      } finally {
        if (showSpinner) {
          setLoadingDonor(false);
        }
      }
    },
    [userId, addressId]
  );

  useEffect(() => {
    loadDonor();
  }, [loadDonor]);

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
      };

      if (formData.nextEligibleDate) {
        registerData.nextEligibleDate = formData.nextEligibleDate;
      }
      if (formData.availabilities.length > 0) {
        registerData.availabilities = formData.availabilities;
      }
      if (formData.healthConditionIds.length > 0) {
        registerData.healthConditionIds = formData.healthConditionIds;
      }

      const response = await donorService.registerDonor(registerData);
      if (response.success && response.data) {
        await loadDonor({ showSpinner: false });
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

  const handleAvailabilityUpdate = (
    index: number,
    field: "weekday" | "timeFromMin" | "timeToMin",
    value: number | string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.availabilities];
      const current = updated[index] || { weekday: 1, timeFromMin: 480, timeToMin: 1020 };
      if (field === "weekday") {
        current.weekday = Number(value);
      } else if (field === "timeFromMin") {
        current.timeFromMin = timeToMinutes(String(value));
      } else if (field === "timeToMin") {
        current.timeToMin = timeToMinutes(String(value));
      }
      updated[index] = { ...current };
      return { ...prev, availabilities: updated };
    });
  };

  const handleAddAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availabilities: [
        ...prev.availabilities,
        { weekday: 1, timeFromMin: 540, timeToMin: 1020 },
      ],
    }));
  };

  const handleRemoveAvailability = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    if (!donor?.donorId && !donor?.id) {
      setError("Không tìm thấy thông tin donor");
      return;
    }

    // Validate availability slots if present
    for (const slot of formData.availabilities) {
      if (slot.timeFromMin >= slot.timeToMin) {
        setError("Giờ bắt đầu phải nhỏ hơn giờ kết thúc trong lịch sẵn sàng.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updateData: UpdateDonorRequest = {
        addressId: formData.addressId || undefined,
        travelRadiusKm: formData.travelRadiusKm,
        isReady: formData.isReady,
      };

      if (formData.nextEligibleDate) {
        updateData.nextEligibleDate = formData.nextEligibleDate;
      }
      if (formData.availabilities.length > 0) {
        updateData.availabilities = formData.availabilities;
      }
      if (formData.healthConditionIds.length > 0) {
        updateData.healthConditionIds = formData.healthConditionIds;
      }

      const response = await donorService.updateMyDonor(updateData);
      if (response.success && response.data) {
        await loadDonor({ showSpinner: false });
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
      setReadyStatusLoading(true);
      setError("");
      const newReadyStatus = !donor.isReady;
      const response = await donorService.updateReadyStatus(donorId, {
        donorId,
        isReady: newReadyStatus,
      });
      if (response.success && response.data) {
        setFormData((prev) => ({ ...prev, isReady: newReadyStatus }));
        await loadDonor({ showSpinner: false });
        setSuccess(`Đã ${newReadyStatus ? "bật" : "tắt"} trạng thái sẵn sàng hiến máu`);
      } else {
        setError(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái";
      setError(errorMessage);
    } finally {
      setReadyStatusLoading(false);
    }
  };

  const availabilityItems = useMemo(() => {
    if (!donor?.availabilities || donor.availabilities.length === 0) {
      return [];
    }
    return donor.availabilities.map((slot, index) => {
      const weekdayLabel =
        WEEKDAYS.find((day) => day.value === slot.weekday)?.label || `Thứ ${slot.weekday}`;
      return {
        id: `${slot.weekday}-${index}`,
        label: weekdayLabel,
        time: `${formatMinutesToTime(slot.timeFromMin)} - ${formatMinutesToTime(slot.timeToMin)}`,
      };
    });
  }, [donor?.availabilities]);

  const healthConditionItems = useMemo(() => {
    if (!donor?.healthConditions || donor.healthConditions.length === 0) {
      return [];
    }
    return donor.healthConditions.map((condition) => ({
      id: condition.conditionId,
      label: condition.conditionName || `Mã ${condition.conditionId}`,
    }));
  }, [donor?.healthConditions]);

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
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-blue-100 bg-white shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
                    Hồ sơ người hiến
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {donor.fullName || "Chưa cập nhật"}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    donor.isReady
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {donor.isReady ? "Sẵn sàng hiến máu" : "Chưa sẵn sàng"}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Nhóm máu", value: donor.bloodGroup || "Chưa cập nhật" },
                  { label: "Email", value: donor.email || "Chưa cập nhật" },
                  { label: "Số điện thoại", value: donor.phoneNumber || "Chưa cập nhật" },
                  {
                    label: "Ngày có thể hiến tiếp",
                    value: donor.nextEligibleDate
                      ? new Date(donor.nextEligibleDate).toLocaleDateString("vi-VN")
                      : "Chưa xác định",
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{item.label}</p>
                    <p className="text-gray-900 font-medium">{item.value}</p>
                  </div>
                ))}
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Địa chỉ</p>
                  <p className="text-gray-900 font-medium">
                    {donor.addressDisplay || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Bán kính di chuyển</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {donor.travelRadiusKm || donor.travelRadiuskm || 0}
                    <span className="text-base font-medium text-gray-500 ml-1">km</span>
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Tọa độ</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {(donor.latitude && donor.latitude.toFixed(4)) || "?"},{" "}
                    {(donor.longitude && donor.longitude.toFixed(4)) || "?"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  Tạo lúc:{" "}
                  <strong className="text-gray-800">
                    {donor.createdAt
                      ? new Date(donor.createdAt).toLocaleString("vi-VN")
                      : "Chưa xác định"}
                  </strong>
                </span>
                <span>
                  Cập nhật:{" "}
                  <strong className="text-gray-800">
                    {donor.updatedAt
                      ? new Date(donor.updatedAt).toLocaleString("vi-VN")
                      : "Chưa xác định"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-green-100 bg-green-50 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-white/70 p-2">
                    <Heart className="w-5 h-5 text-green-600" />
                  </span>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Trạng thái hiến máu</p>
                    <p className="text-sm text-green-800">
                      {donor.isReady
                        ? "Bạn đang mở trạng thái nhận lời mời hiến máu."
                        : "Bạn đang tạm tắt trạng thái nhận lời mời."}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleToggleReadyStatus}
                  disabled={readyStatusLoading}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-60"
                >
                  {readyStatusLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : donor.isReady ? (
                    "Tạm tắt trạng thái"
                  ) : (
                    "Bật trạng thái sẵn sàng"
                  )}
                </Button>
              </div>

              <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-900">Lịch sẵn sàng</p>
                  {availabilityItems.length > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-semibold">
                      {availabilityItems.length} khung giờ
                    </span>
                  )}
                </div>
                {availabilityItems.length > 0 ? (
                  <div className="space-y-2">
                    {availabilityItems.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border border-blue-50 bg-blue-50/60 px-3 py-2 text-sm text-blue-900"
                      >
                        <span className="font-semibold">{slot.label}</span>
                        <span>{slot.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa thiết lập lịch cụ thể.</p>
                )}
              </div>

              <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-purple-900 mb-3">Tình trạng sức khỏe</p>
                {healthConditionItems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {healthConditionItems.map((condition) => (
                      <span
                        key={condition.id}
                        className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800"
                      >
                        {condition.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có ghi chú sức khỏe.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Cập nhật nhanh
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                Điều chỉnh thông tin bạn có thể thay đổi
              </h3>
              <p className="text-sm text-gray-600">
                Chỉ các trường ảnh hưởng đến khả năng điều phối hiến máu có thể chỉnh sửa trực
                tiếp tại đây.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
              <div className="rounded-xl border border-white bg-white p-5 shadow-sm space-y-2">
                <Label htmlFor="travelRadius" className="text-black font-semibold">
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
                  className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                />
                <p className="text-xs text-gray-500">
                  Hệ thống ưu tiên mời bạn trong phạm vi bán kính này.
                </p>
              </div>

              <div className="rounded-xl border border-white bg-white p-5 shadow-sm space-y-3">
                <div>
                  <Label className="text-black font-semibold">Địa chỉ</Label>
                  <p className="text-xs text-gray-500">
                    Cập nhật địa chỉ giúp hệ thống điều phối gần nhất với bạn.
                  </p>
                </div>
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
            </div>

            <div className="rounded-xl border border-white bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black font-semibold">Tình trạng sức khỏe</Label>
                  <p className="text-xs text-gray-500">
                    Đánh dấu các bệnh lý hiện có để nhân viên y tế nắm thông tin.
                  </p>
                </div>
                <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full font-semibold">
                  {formData.healthConditionIds.length} mục
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {healthConditions.map((hc) => (
                  <div
                    key={hc.id}
                    className="flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50/60 px-2 py-1"
                  >
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
                    <Label
                      htmlFor={`health-${hc.id}`}
                      className="text-xs md:text-sm cursor-pointer text-gray-700"
                    >
                      {hc.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black font-semibold">Lịch sẵn sàng</Label>
                  <p className="text-xs text-gray-500">
                    Cho biết những khung giờ bạn có thể nhận lời mời hiến máu.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={handleAddAvailability}
                >
                  Thêm khung giờ
                </Button>
              </div>
              {formData.availabilities.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Chưa có lịch sẵn sàng. Thêm khung giờ để các trung tâm biết khi nào nên liên hệ.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.availabilities.map((slot, index) => (
                    <div
                      key={`${slot.weekday}-${index}`}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold uppercase text-gray-500">Ngày</Label>
                        <Select
                          value={slot.weekday}
                          onChange={(e) =>
                            handleAvailabilityUpdate(index, "weekday", Number(e.target.value))
                          }
                          className="w-full"
                        >
                          {WEEKDAYS.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold uppercase text-gray-500">
                          Bắt đầu
                        </Label>
                        <Input
                          type="time"
                          value={formatMinutesToTime(slot.timeFromMin)}
                          onChange={(e) =>
                            handleAvailabilityUpdate(index, "timeFromMin", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold uppercase text-gray-500">
                          Kết thúc
                        </Label>
                        <Input
                          type="time"
                          value={formatMinutesToTime(slot.timeToMin)}
                          onChange={(e) =>
                            handleAvailabilityUpdate(index, "timeToMin", e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => handleRemoveAvailability(index)}
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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


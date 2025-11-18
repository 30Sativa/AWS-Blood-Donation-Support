// src/components/ui/AppointmentList.tsx
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";
import { donorService } from "@/services/donorService";
import { profileService } from "@/services/profileService";
import type { Appointment } from "@/types/appointment";
import { Button } from "@/components/ui/button";

interface AppointmentListProps {
  onAppointmentUpdate?: () => void;
}

export function AppointmentList({ onAppointmentUpdate }: AppointmentListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const profileResponse = await profileService.getCurrentUser();
      if (!profileResponse.success || !profileResponse.data) {
        throw new Error("Failed to get user profile");
      }

      const userId = profileResponse.data.userId;
      const donorResponse = await donorService.getDonorByUserId(userId);

      if (!donorResponse || !donorResponse.data) {
        setError("Bạn chưa đăng ký làm donor.");
        return;
      }

      const donorId = donorResponse.data.id;
      if (!donorId) {
        throw new Error("Donor ID not found");
      }

      const appointmentsData = await appointmentService.getAppointmentsByDonor(donorId);
      
      // Sort by scheduled date (newest first)
      const sorted = appointmentsData.sort((a, b) => 
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
      
      setAppointments(sorted);
    } catch (err: any) {
      console.error("Load appointments error:", err);
      setError(err.message || "Không thể tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) {
      return;
    }

    try {
      setCancellingId(id);
      await appointmentService.cancelAppointment(id);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      onAppointmentUpdate?.();
    } catch (err: any) {
      console.error("Cancel appointment error:", err);
      alert("Không thể hủy lịch hẹn. Vui lòng thử lại.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; icon: React.ReactElement } } = {
      Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
      },
      Confirmed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      Completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      Cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <XCircle className="w-4 h-4" />,
      },
      NoShow: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  const canCancel = (appointment: Appointment) => {
    const scheduledDate = new Date(appointment.scheduledAt);
    const now = new Date();
    const hoursUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      (appointment.status === "Pending" || appointment.status === "Confirmed") &&
      hoursUntil > 24
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang tải lịch hẹn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Không thể tải dữ liệu</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">Chưa có lịch hẹn</p>
        <p className="text-gray-500 text-sm mt-2">
          Hãy đặt lịch hiến máu để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const { date, time } = formatDateTime(appointment.scheduledAt);
        const isCancellable = canCancel(appointment);

        return (
          <div
            key={appointment.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{date}</p>
                    <p className="text-sm text-gray-600">{time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location #{appointment.locationId}</span>
                </div>

                <div className="mt-3">{getStatusBadge(appointment.status)}</div>
              </div>

              {isCancellable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={cancellingId === appointment.id}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {cancellingId === appointment.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang hủy...
                    </>
                  ) : (
                    "Hủy lịch"
                  )}
                </Button>
              )}
            </div>

            {appointment.status === "Pending" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  Lịch hẹn đang chờ xác nhận. Bạn sẽ nhận được thông báo khi được xác nhận.
                </p>
              </div>
            )}

            {!isCancellable && appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  Không thể hủy lịch hẹn trong vòng 24 giờ trước thời gian hẹn.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

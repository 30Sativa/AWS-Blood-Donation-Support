// src/pages/member/MyAppointments.tsx
import { AppointmentList } from "@/components/ui/AppointmentList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export function MyAppointments() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">My Appointments</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các lịch hẹn hiến máu của bạn
          </p>
        </div>
        <Button
          onClick={() => navigate("/member/register-donation")}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Đặt lịch mới
        </Button>
      </div>

      <AppointmentList />
    </div>
  );
}

import { User } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import logo from "@/assets/HomePage/logo.jpg";

export function Header() {
  const { profile, loading } = useUserProfile();

  return (

    //Tên ứng dụng và thông tin người dùng ở header
    <header className="fixed top-0 left-0 w-full h-16 border-b border-gray-300 bg-gray-100 z-50">
      <div className="h-full w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Blood Bank Logo" className="w-11 h-11 object-contain" />
          <span className="text-xl font-semibold text-black">Blood Bank</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-black">
            {loading ? "Loading..." : profile?.fullName || "Guest"}
          </span>
        </div>
      </div>
    </header>
  );
}


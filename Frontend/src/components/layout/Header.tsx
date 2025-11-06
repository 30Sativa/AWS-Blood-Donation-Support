import { User, Droplet } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export function Header() {
  const { profile, loading } = useUserProfile();

  return (

    //Tên ứng dụng và thông tin người dùng ở header
    <header className="fixed top-0 left-0 w-full h-16 border-b border-gray-300 bg-gray-100 z-50">
      <div className="h-full w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Droplet className="w-8 h-8 text-red-600 fill-red-600" />
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


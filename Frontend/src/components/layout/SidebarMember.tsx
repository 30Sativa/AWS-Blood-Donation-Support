import { Link, useLocation } from "react-router-dom";
import {
  UserPlus,
  UserCheck,
  History,
  Bell,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Droplet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  { path: "/member/register-donation", icon: UserPlus, label: "Register Donation" },
  { path: "/member/health-check", icon: UserCheck, label: "Health Check" },
  { path: "/member/history", icon: History, label: "History" },
  { path: "/member/notifications", icon: Bell, label: "Notifications" },
  { path: "/member/sos", icon: AlertCircle, label: "SOS" },
  { path: "/member/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/member/settings", icon: Settings, label: "Account Settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-4 border-b border-gray-300 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Droplet className="w-8 h-8 text-red-600 fill-red-600" />
          <span className="text-xl font-semibold text-black">Blood Bank</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-300 flex-shrink-0 mt-auto">
        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}


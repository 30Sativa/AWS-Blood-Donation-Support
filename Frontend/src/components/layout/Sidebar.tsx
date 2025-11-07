import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  UserPlus,
  UserCheck,
  History,
  Bell,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SidebarProps {
  items?: SidebarItem[];
  onCollapsedChange?: (collapsed: boolean) => void;
  initialCollapsed?: boolean;
}

const defaultMemberItems: SidebarItem[] = [
  { path: "/member/register-donation", icon: UserPlus, label: "Register Donation" },
  { path: "/member/health-check", icon: UserCheck, label: "Health Check" },
  { path: "/member/history", icon: History, label: "History" },
  { path: "/member/notifications", icon: Bell, label: "Notifications" },
  { path: "/member/sos", icon: AlertCircle, label: "SOS" },
  { path: "/member/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/member/settings", icon: Settings, label: "Account Settings" },
];

export default function Sidebar({ items = defaultMemberItems, onCollapsedChange, initialCollapsed = true }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);

  // Notify parent of collapse state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    navigate("/auth/login");
  };

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={cn(
        "bg-gray-100 flex flex-col fixed left-0 top-16 bottom-0 transition-all duration-300 z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg transition-colors",
                isCollapsed ? "justify-center px-3 py-3" : "px-4 py-3",
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 flex-shrink-0 mt-auto">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors",
            isCollapsed ? "justify-center px-3 py-3" : "justify-center gap-3 px-4 py-3"
          )}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Log out</span>
          )}
        </button>
      </div>
    </aside>
  );
}

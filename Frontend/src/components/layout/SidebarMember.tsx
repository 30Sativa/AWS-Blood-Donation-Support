import Sidebar from "./Sidebar";
import type { SidebarItem } from "./Sidebar";
import {
  UserPlus,
  UserCheck,
  History,
  Bell,
  AlertCircle,
  BarChart3,
  Settings,
} from "lucide-react";

// Member-specific items — you can expand this list or move it to a separate config/file.
const memberItems: SidebarItem[] = [
  { path: "/member/register-donation", icon: UserPlus, label: "Register Donation" },
  { path: "/member/health-check", icon: UserCheck, label: "Health Check" },
  { path: "/member/history", icon: History, label: "History" },
  { path: "/member/notifications", icon: Bell, label: "Notifications" },
  { path: "/member/sos", icon: AlertCircle, label: "SOS" },
  { path: "/member/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/member/settings", icon: Settings, label: "Settings" },
];

export default function SidebarMember(props: { onCollapsedChange?: (b: boolean) => void }) {
  return <Sidebar items={memberItems} onCollapsedChange={props.onCollapsedChange} />;
}


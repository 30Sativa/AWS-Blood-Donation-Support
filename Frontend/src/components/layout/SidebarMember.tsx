import Sidebar from "./Sidebar";
import type { SidebarItem } from "./Sidebar";
import {
  UserPlus,
  Radar,
  History,
  Bell,
  AlertCircle,
  BarChart3,
  Settings,
  HeartHandshake,
} from "lucide-react";

// Member-specific items — you can expand this list or move it to a separate config/file.
const memberItems: SidebarItem[] = [
  { path: "/member/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/member/register-donor", icon: UserPlus, label: "Register Donor" },
  { path: "/member/donor-profile", icon: HeartHandshake, label: "Donor Profile" },
  { path: "/member/nearby-donors", icon: Radar, label: "Nearby Donors" },
  { path: "/member/history", icon: History, label: "Donation History" },
  { path: "/member/requests", icon: AlertCircle, label: "My Requests" },
  { path: "/member/notifications", icon: Bell, label: "Notifications" },
  { path: "/member/settings", icon: Settings, label: "Settings" },
];

export default function SidebarMember(props: { onCollapsedChange?: (b: boolean) => void }) {
  return <Sidebar items={memberItems} onCollapsedChange={props.onCollapsedChange} />;
}


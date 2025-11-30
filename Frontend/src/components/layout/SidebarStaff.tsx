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
  Users,
  FileText,
} from "lucide-react";

// Staff có thể truy cập cả member features và một số admin features
const staffItems: SidebarItem[] = [
  // Member features
  { path: "/member/register-donor", icon: UserPlus, label: "Register Donor" },
  { path: "/member/donor-profile", icon: HeartHandshake, label: "Donor Profile" },
  { path: "/member/nearby-donors", icon: Radar, label: "Nearby Donors" },
  { path: "/member/history", icon: History, label: "History" },
  { path: "/member/notifications", icon: Bell, label: "Notifications" },
  { path: "/member/sos", icon: AlertCircle, label: "Emergency Requests" },
  { path: "/member/dashboard", icon: BarChart3, label: "Dashboard" },
  // Admin features (staff có thể quản lý một số thứ)
  { path: "/admin/accounts", icon: Users, label: "Manage Accounts" },
  { path: "/admin/manage-blog", icon: FileText, label: "Manage Blog" },
  { path: "/member/settings", icon: Settings, label: "Settings" },
];

export default function SidebarStaff(props: { onCollapsedChange?: (b: boolean) => void }) {
  return <Sidebar items={staffItems} onCollapsedChange={props.onCollapsedChange} />;
}

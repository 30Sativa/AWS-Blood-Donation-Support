import Sidebar from "./Sidebar";
import type { SidebarItem } from "./Sidebar";
import { UserPlus, UserCheck, History, Bell, BarChart3, Settings } from "lucide-react";

const staffItems: SidebarItem[] = [
  // các mục dành cho staff
];

export default function SidebarStaff(props: { onCollapsedChange?: (b: boolean) => void }) {
  return <Sidebar items={staffItems} onCollapsedChange={props.onCollapsedChange} />;
}

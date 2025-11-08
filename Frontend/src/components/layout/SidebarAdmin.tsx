import Sidebar from "./Sidebar";
import type { SidebarItem } from "./Sidebar";
import { Users, FileText, BarChart3, Bell, Settings } from "lucide-react";

const adminItems: SidebarItem[] = [
//các mục dành cho admin
];

export default function SidebarAdmin(props: { onCollapsedChange?: (b: boolean) => void }) {
  return <Sidebar items={adminItems} onCollapsedChange={props.onCollapsedChange} />;
}

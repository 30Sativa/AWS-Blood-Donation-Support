import Sidebar from "./Sidebar";
import type { SidebarItem } from "./Sidebar";
import { Users, FileText, BarChart3 } from "lucide-react";

const adminItems: SidebarItem[] = [
  {
    path: "/admin/accounts",
    icon: Users,
    label: "Manage Accounts"
  },
  {
    path: "/admin/manage-blog",
    icon: FileText,
    label: "Manage Blog"
  },
  {
    path: "/admin/reports",
    icon: BarChart3,
    label: "Reports"
  }
];

export default function SidebarAdmin(props: { onCollapsedChange?: (b: boolean) => void }) {
  return <Sidebar items={adminItems} onCollapsedChange={props.onCollapsedChange} />;
}

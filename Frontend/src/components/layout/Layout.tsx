import { useState } from "react";
import { Header } from "./Header";
import SidebarMember from "./SidebarMember";
import SidebarAdmin from "./SidebarAdmin";
import SidebarStaff from "./SidebarStaff";

interface LayoutProps {
  children: React.ReactNode;
}

type RoleKey = "Admin" | "Staff" | "Member" | "Guest";

function getRoleFromToken(): RoleKey {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "Member";
    const payload = token.split(".")[1];
    if (!payload) return "Member";
    const decoded = JSON.parse(atob(payload));

    const rawRole =
      decoded?.role || decoded?.roleCode || decoded?.role_code || decoded?.roleName ||
      (Array.isArray(decoded?.roles) ? decoded.roles[0] : null) || decoded?.roleId || null;

    const key = String(rawRole ?? "MEMBER").toUpperCase();
    if (key === "ADMIN") return "Admin";
    if (key === "STAFF") return "Staff";
    if (key === "GUEST") return "Guest";
    return "Member";
  } catch (err) {
    return "Member";
  }
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const role = getRoleFromToken();
  console.log('Current Role:', role); // Debug log

  // Check the current pathname to determine if we're in the admin section
  const isAdminPath = window.location.pathname.startsWith('/admin');
  console.log('Is Admin Path:', isAdminPath); // Debug log

  // Use SidebarAdmin for admin paths regardless of role, otherwise use role-based sidebar
  const SidebarComponent = isAdminPath ? SidebarAdmin : 
    (role === "Admin" ? SidebarAdmin : role === "Staff" ? SidebarStaff : SidebarMember);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar manages its own state but notifies us of changes */}
      <SidebarComponent onCollapsedChange={setIsCollapsed} />

      <div
        className="flex-1 flex flex-col transition-all duration-300 pt-16"
        style={{ marginLeft: isCollapsed ? "80px" : "256px" }}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}


import { useState } from "react";
import { Header } from "./Header";
import SidebarMember from "./SidebarMember";
import SidebarAdmin from "./SidebarAdmin";
import SidebarStaff from "./SidebarStaff";

interface LayoutProps {
  children: React.ReactNode;
}

type RoleKey = "admin" | "staff" | "member";

/**
 * Lấy role từ localStorage (đồng bộ với PrivateRoutes.tsx)
 * Format: "admin" | "staff" | "member" (lowercase)
 */
function getRoleFromStorage(): RoleKey {
  try {
    const role = localStorage.getItem("role") as RoleKey | null;
    if (role === "admin" || role === "staff" || role === "member") {
      return role;
    }
    return "member"; // Default fallback
  } catch (err) {
    return "member";
  }
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const role = getRoleFromStorage();

  // Check the current pathname to determine if we're in the admin section
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const isMemberPath = window.location.pathname.startsWith('/member');

  // Logic phân quyền sidebar:
  // - Nếu đang ở /admin path -> dùng SidebarAdmin (chỉ admin/staff mới vào được nhờ ProtectedRoute)
  // - Nếu đang ở /member path -> dùng role-based sidebar
  // - Admin vào /member sẽ thấy SidebarAdmin
  // - Staff vào /member sẽ thấy SidebarStaff
  // - Member vào /member sẽ thấy SidebarMember
  let SidebarComponent;
  if (isAdminPath) {
    SidebarComponent = SidebarAdmin;
  } else if (isMemberPath) {
    // Trong member section, hiển thị sidebar theo role
    if (role === "admin") {
      SidebarComponent = SidebarAdmin; // Admin có thể thấy admin sidebar ngay cả trong /member
    } else if (role === "staff") {
      SidebarComponent = SidebarStaff;
    } else {
      SidebarComponent = SidebarMember;
    }
  } else {
    // Fallback: dùng role-based
    SidebarComponent = role === "admin" ? SidebarAdmin : role === "staff" ? SidebarStaff : SidebarMember;
  }

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


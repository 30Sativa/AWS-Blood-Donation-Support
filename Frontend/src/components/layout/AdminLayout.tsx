import { Outlet, NavLink } from "react-router-dom";
import { LayoutGrid, FileText, BarChart3, LogOut } from "lucide-react";
import logo from "@/assets/HomePage/logo.jpg";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ĐÃ XOÁ thanh ngăn cách phía trên */}

      <div className="grid grid-cols-12">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 xl:col-span-2 bg-white border-r border-neutral-200 min-h-screen p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <img
              src={logo}
              alt="BloodCare logo"
              className="h-12 w-12 md:h-12 md:w-12 rounded-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div>
              <p className="text-lg font-semibold leading-tight">BloodCare</p>
              <p className="text-sm text-neutral-500 -mt-0.5">Admin</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SideLink to="/admin/accounts" icon={<LayoutGrid className="h-4 w-4" />} label="Manage Accounts" />
            <SideLink to="/admin/manage-blog" icon={<FileText className="h-4 w-4" />} label="Manage Blog" />
            <SideLink to="/admin/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
          </nav>

          <div className="mt-auto pt-6">
            <SideLink to="/auth/logout" icon={<LogOut className="h-4 w-4" />} label="Log out" />
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 xl:col-span-10 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SideLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition",
          isActive ? "bg-red-600/10 text-red-700 ring-1 ring-red-600/20" : "hover:bg-neutral-100 text-neutral-700",
        ].join(" ")
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default AdminLayout;

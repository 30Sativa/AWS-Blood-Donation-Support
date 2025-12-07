import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../services/userService";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.success && response.data) {
          setFullName(response.data.fullName || "");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleDisplay = () => {
    if (!user?.role) return "User";
    return user.role.charAt(0) + user.role.slice(1).toLowerCase();
  };

  const getDashboardTitle = () => {
    if (!user?.role) return "Dashboard";
    const role = user.role;
    if (role === "ADMIN") return "Admin Dashboard";
    if (role === "STAFF") return "Staff Dashboard";
    if (role === "MEMBER") return "Member Dashboard";
    return "Dashboard";
  };

  const getDashboardSubtitle = () => {
    if (!user?.role) return "";
    const role = user.role;
    if (role === "ADMIN") return "System Management";
    if (role === "STAFF") return "Staff Management";
    if (role === "MEMBER") return "Member Portal";
    return "";
  };

  const getSidebarItems = () => {
    if (!user?.role) return [];
    const role = user.role;
    
    if (role === "ADMIN") {
      return [
        { 
          label: "Manage Blog", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ), 
          path: "/dashboard/admin/blog" 
        },
        { 
          label: "Manage Users", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ), 
          path: "/dashboard/admin/users" 
        },
      ];
    }
    
    if (role === "STAFF") {
      return [
        { 
          label: "Manage Requests", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ), 
          path: "/dashboard/staff/requests" 
        },
        { 
          label: "Manage Donors", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          ), 
          path: "/dashboard/staff/donors" 
        },
        { 
          label: "Nearby Donors", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ), 
          path: "/dashboard/staff/nearby-donors" 
        },
      ];
    }
    
    if (role === "MEMBER") {
      return [
        { 
          label: "My Requests", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ), 
          path: "/dashboard/member/requests" 
        },
        { 
          label: "My Donor", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          ), 
          path: "/dashboard/member/donor" 
        },
        { 
          label: "My Profile", 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ), 
          path: "/dashboard/member/profile" 
        },
      ];
    }
    
    return [];
  };

  const getTopMenuItems = () => {
    if (!user?.role) return [];
    const role = user.role;
    
    if (role === "ADMIN") {
      return [
        { label: "Dashboard", path: "/dashboard/admin" },
        { label: "Blog", path: "/dashboard/admin/blog" },
        { label: "Users", path: "/dashboard/admin/users" },
      ];
    }
    
    if (role === "STAFF") {
      return [
        { label: "Dashboard", path: "/dashboard/staff" },
        { label: "Requests", path: "/dashboard/staff/requests" },
        { label: "Donors", path: "/dashboard/staff/donors" },
        { label: "Nearby Donors", path: "/dashboard/staff/nearby-donors" },
      ];
    }
    
    if (role === "MEMBER") {
      return [
        { label: "Dashboard", path: "/dashboard/member" },
        { label: "My Requests", path: "/dashboard/member/requests" },
        { label: "My Donor", path: "/dashboard/member/donor" },
        { label: "My Profile", path: "/dashboard/member/profile" },
      ];
    }
    
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-white to-gray-50 shadow-xl transition-all duration-300 fixed h-screen top-0 left-0 z-20 border-r border-gray-200 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 bg-gradient-to-r from-red-600 to-red-700 flex items-center px-3 shadow-md">
          <div className="flex items-center justify-between w-full">
            {sidebarOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white leading-tight">
                    {getDashboardTitle()}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition w-full flex justify-center"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {getSidebarItems().map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 transform scale-[1.02]"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-red-600"}`}>
                  {item.icon}
                </span>
                <span className={`${sidebarOpen ? "block" : "hidden"} font-medium text-sm whitespace-nowrap`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className={`${sidebarOpen ? "flex" : "hidden"} items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100`}>
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {getRoleDisplay()}
              </p>
            </div>
          </div>
          {!sidebarOpen && (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-20"
      }`}>
        {/* Header - Simple with Full Name */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center sticky top-0 z-10">
          <div className="px-6 w-full flex items-center justify-between">
            {/* Full Name */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {fullName || "User"}
              </h1>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
            >
              <span>Logout</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

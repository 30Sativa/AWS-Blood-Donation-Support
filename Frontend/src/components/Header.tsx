import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../assets/HomePage/logo.jpg";

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      const role = localStorage.getItem("role");
      
      if (token) {
        setIsAuthenticated(true);
        setUserInfo({
          email: userEmail,
          fullName: userName,
          role: role,
        });
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    };

    checkAuth();
    // Re-check auth state periodically
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserInfo(null);
    setShowDropdown(false);
    toast.success("Đăng xuất thành công!");
    navigate("/", { replace: true });
  };

  const handleDashboard = () => {
    const role = userInfo?.role || localStorage.getItem("role");
    setShowDropdown(false);
    if (role === "admin" || role === "staff") {
      navigate("/admin/accounts", { replace: true });
    } else {
      navigate("/member/dashboard", { replace: true });
    }
  };

  const handleProfile = () => {
    setShowDropdown(false);
    navigate("/member/settings", { replace: true });
  };

  return (
    <header className="w-full bg-white shadow-sm relative top-0 left-0 z-50">
      <div className="w-full px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: logo */}
        <div className="flex items-center flex-shrink-0 gap-2 md:gap-3">
          <img src={logo} alt="Blood Care Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0" />
          <h1 className="text-lg md:text-xl lg:text-2xl uppercase font-bold text-black">
            Blood Care
          </h1>
        </div>
        {/* Center: menu */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-4 lg:space-x-8 mx-4">
          <Link to="/" className="text-gray-900 hover:text-red-600 transition-colors whitespace-nowrap text-sm lg:text-base">
            Home
          </Link>
          <Link to="/introduce" className="text-gray-900 hover:text-red-600 transition-colors whitespace-nowrap text-sm lg:text-base">
            Introduce
          </Link>
          <Link to="/service" className="text-gray-900 hover:text-red-600 transition-colors whitespace-nowrap text-sm lg:text-base">
            Service
          </Link>
          <Link to="/contact" className="text-gray-900 hover:text-red-600 transition-colors whitespace-nowrap text-sm lg:text-base">
            Contact
          </Link>
          <Link to="/blog" className="text-gray-900 hover:text-red-600 transition-colors whitespace-nowrap text-sm lg:text-base">
            Blog
          </Link>
        </nav>

        {/* Right: buttons or user info */}
        <div className="flex items-center justify-end flex-shrink-0">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {userInfo?.fullName?.charAt(0)?.toUpperCase() || userInfo?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-700 font-medium hidden md:inline whitespace-nowrap">
                  {userInfo?.fullName || userInfo?.email || "User"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu - sát bên phải, align với button */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100] animate-fade-in">
                  <button
                    onClick={handleProfile}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleDashboard}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm px-3 md:px-4"
                asChild
              >
                <Link to="/auth/login">Log in</Link>
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700 text-sm px-3 md:px-4" asChild>
                <Link to="/auth/login?mode=register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
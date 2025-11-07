import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { ACCESS_TOKEN, USER, commonSettings } from "@/utils/setting";
import logo from "../assets/HomePage/logo.jpg";

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = commonSettings.getStorage<string>(ACCESS_TOKEN);
      const user = commonSettings.getStorageJson(USER);
      if (token) {
        setIsAuthenticated(true);
        setUserInfo(user);
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

  const handleLogout = () => {
    commonSettings.clearStorageItem(ACCESS_TOKEN);
    commonSettings.clearStorageItem(USER);
    setIsAuthenticated(false);
    setUserInfo(null);
    toast.success("Đăng xuất thành công!");
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="w-full bg-white shadow-sm relative top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center">
        {/* Left: logo */}
        <div className="flex items-center flex-1 gap-3">
          <img src={logo} alt="Blood Care Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-xl md:text-2xl uppercase font-bold text-black">
            Blood Care
          </h1>
        </div>
        {/* Center: menu */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link to="/" className="text-gray-900 hover:text-red-600 transition-colors">
            Home
          </Link>
          <Link to="/introduce" className="text-gray-900 hover:text-red-600 transition-colors">
            Introduce
          </Link>
          <Link to="/service" className="text-gray-900 hover:text-red-600 transition-colors">
            Service
          </Link>
          <Link to="/contact" className="text-gray-900 hover:text-red-600 transition-colors">
            Contact
          </Link>
          <Link to="/blog" className="text-gray-900 hover:text-red-600 transition-colors">
            Blog
          </Link>
        </nav>

        {/* Right: buttons or user info */}
        <div className="flex-1 flex items-center justify-end">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 hidden md:inline">
                {userInfo?.email || userInfo?.fullName || "User"}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                asChild
              >
                <Link to="/auth/login">Log in</Link>
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" asChild>
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
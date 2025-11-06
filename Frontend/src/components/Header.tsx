// Header.tsx

import { Link, useNavigate } from "react-router-dom"; // <<< Thêm useNavigate
import { Button } from "./ui/button";
import logo from "../assets/HomePage/logo.jpg";
// 💡 GIẢ ĐỊNH: Import hook từ Context bạn đã tạo
import { useAuth } from "../context/AuthContext"; // Thay đổi đường dẫn này nếu cần

// Thêm định nghĩa Role (giống trong PrivateRoute.tsx)
type Role = "member" | "staff" | "admin"; 

const Header = () => {
  // 1. Lấy thông tin từ Auth Context
  // Giả định Auth Context cung cấp isAuthenticated, user (chứa role, email/name), và hàm logout
  const { isAuthenticated, user, logout } = useAuth(); 
  const navigate = useNavigate();

  // Hàm xử lý Logout
  const handleLogout = () => {
    logout(); // Gọi hàm logout để xóa token
    navigate("/auth/login"); // Chuyển hướng về trang đăng nhập
  };

  // Hàm xác định đường dẫn Dashboard chính dựa trên Role
  const getDashboardPath = (role: Role | undefined) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "member":
      default:
        // Cần đảm bảo route /member có component Index, hoặc dùng /member/dashboard
        return "/member"; 
    }
  };

  // ----------------------------------------------------
  // Component hiển thị khi đã Đăng nhập (Authentication Controls)
  // ----------------------------------------------------
  const authenticatedControls = (
  <div className="hidden md:flex items-center space-x-4">
    {/* 💡 AVATAR VÀ TÊN USER */}
    <div className="flex items-center space-x-2">
      {/* Avatar tròn - Lấy chữ cái đầu tiên của tên */}
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-400 text-red-600 font-bold text-sm">
        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
      </div>
      
      {/* Tên người dùng */}
      <span className="text-gray-900 font-semibold text-sm whitespace-nowrap">
        {user?.name || "Người dùng"}
      </span>
    </div>
    
    {/* Dropdown Selection/Logout */}
    <select
      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-600 rounded-md cursor-pointer focus:ring-red-500 focus:border-red-500"
      onChange={(e) => {
        const value = e.target.value;
        if (value === "logout") {
          handleLogout();
        } else if (value) {
          navigate(value);
        }
      }}
      // Đặt giá trị mặc định là rỗng để hiện "Tài khoản"
      defaultValue="" 
    >
      <option value="" disabled>Tài khoản</option> 
      {/* Dashboard */}
      <option value={getDashboardPath(user?.role as Role)}>Dashboard</option> 
      {/* Profile: Giả sử Profile là route con của Dashboard */}
      <option value={`${getDashboardPath(user?.role as Role)}/profile`}>Profile</option> 
      {/* Logout */}
      <option value="logout">Đăng xuất</option>
    </select>
  </div>
);

  // ----------------------------------------------------
  // Component hiển thị khi chưa Đăng nhập (Public Controls - Code gốc)
  // ----------------------------------------------------
  const publicControls = (
    <div className="hidden md:flex items-center space-x-2"> 
        <Button
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
          asChild
        >
          <Link to="/auth/login">Log in</Link>
        </Button>
        <Button className="bg-red-600 text-white hover:bg-red-700" asChild>
          <Link to="/auth/register">Register</Link>
        </Button>
    </div>
  );

  return (
    <header className="w-full bg-white shadow-sm relative top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between"> 
        
        {/* LEFT GROUP: Logo + Menu (Giữ nguyên) */}
        <div className="flex items-center gap-6"> 
          {/* Left: logo (Giữ nguyên) */}
          <div className="flex items-center gap-2 md:gap-3"> 
            <img src={logo} alt="Blood Care Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl md:text-2xl uppercase font-bold text-black">
              Blood Care
            </h1>
          </div>
          
          {/* Center: menu (Giữ nguyên) */}
          <nav className="hidden md:flex items-center space-x-6"> 
            <Link to="/" className="text-gray-900 hover:text-red-600 transition-colors">Home</Link>
            <Link to="/introduce" className="text-gray-900 hover:text-red-600 transition-colors">Introduce</Link>
            <Link to="/service" className="text-gray-900 hover:text-red-600 transition-colors">Service</Link>
            <Link to="/contact" className="text-gray-900 hover:text-red-600 transition-colors">Contact</Link>
            <Link to="/blog" className="text-gray-900 hover:text-red-600 transition-colors">Blog</Link>
          </nav>
        </div>

        {/* 2. RIGHT GROUP: Chuyển đổi giữa hai trạng thái */}
        {isAuthenticated ? authenticatedControls : publicControls} 
      </div>
    </header>
  );
};

export default Header;
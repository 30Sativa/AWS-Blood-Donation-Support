// fileName: AuthContext.tsx (Đã thêm userId và userName)

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Định nghĩa Role - Đồng bộ với PrivateRoute.tsx
type Role = "member" | "staff" | "admin";

// ⭐️ SỬA 1: Thêm userId vào cấu trúc User
interface User {
  userId: string; // ⭐️ ĐÃ THÊM
  email: string;
  name?: string; // Tên hiển thị (Lấy từ userName trong localStorage)
  role: Role;
}

// Định nghĩa cấu trúc Context Type
interface AuthContextType {
  isAuthenticated: boolean; // Trạng thái đã đăng nhập
  user: User | null; // Thông tin người dùng
  logout: () => void; // Hàm đăng xuất
  refreshAuth: () => void; // Hàm để buộc Context tải lại trạng thái
}

// Khởi tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 1. AUTH PROVIDER ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Hàm tải trạng thái người dùng từ localStorage
  const loadAuthState = useCallback(() => {
    // Lấy dữ liệu từ localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role | null;
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId"); // ⭐️ SỬA 2: Lấy thêm userId

    // ⭐️ SỬA 3: Kiểm tra token, role, userEmail VÀ userId
    if (token && role && userEmail && userId) {
      setIsAuthenticated(true);
      // Gán TẤT CẢ thông tin vào state user
      setUser({
        userId: userId, // ⭐️ ĐÃ THÊM
        email: userEmail,
        role: role,
        name: userName || userEmail.split('@')[0] // Tên mặc định là phần trước @
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Tải trạng thái khi ứng dụng khởi động (chỉ chạy 1 lần)
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  // Hàm Đăng xuất
  const logout = () => {
    // Xóa tất cả thông tin xác thực
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId"); // ⭐️ SỬA 4: Xóa thêm userId
    sessionStorage.removeItem("token"); // Nếu bạn cũng dùng sessionStorage

    // Reset state
    setIsAuthenticated(false);
    setUser(null);
  };

  // Giá trị Context được cung cấp
  const value = useMemo(() => ({
    isAuthenticated,
    user,
    logout,
    refreshAuth: loadAuthState,
  }), [isAuthenticated, user, loadAuthState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 2. HOOK USEAUTH ---
// Hook tùy chỉnh để sử dụng Context một cách thuận tiện
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
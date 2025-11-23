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

  // Hàm Đăng xuất
  const logout = useCallback(() => {
    // Xóa tất cả thông tin xác thực
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("tokenExpiry");
    sessionStorage.removeItem("token");

    // Reset state
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Hàm tải trạng thái người dùng từ localStorage
  const loadAuthState = useCallback(() => {
    // Lấy dữ liệu từ localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role | null;
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    // Kiểm tra token expiration
    if (tokenExpiry) {
      const expirationTime = parseInt(tokenExpiry, 10);
      const now = Date.now();
      
      // Nếu token đã hết hạn, xóa tất cả và logout
      if (now >= expirationTime) {
        logout();
        return;
      }
    }

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
  }, [logout]);

  // Tải trạng thái khi ứng dụng khởi động (chỉ chạy 1 lần)
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  // Kiểm tra token expiration định kỳ (mỗi phút)
  useEffect(() => {
    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      if (tokenExpiry) {
        const expirationTime = parseInt(tokenExpiry, 10);
        const now = Date.now();
        
        // Nếu token đã hết hạn, logout
        if (now >= expirationTime) {
          logout();
        }
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenExpiry();

    // Kiểm tra mỗi phút
    const interval = setInterval(checkTokenExpiry, 60000); // 60000ms = 1 phút

    return () => clearInterval(interval);
  }, [logout]);

  // Giá trị Context được cung cấp
  const value = useMemo(() => ({
    isAuthenticated,
    user,
    logout,
    refreshAuth: loadAuthState,
  }), [isAuthenticated, user, loadAuthState, logout]);

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
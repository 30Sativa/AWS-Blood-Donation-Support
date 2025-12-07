import { createContext, useContext, useState, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user từ localStorage
  useEffect(() => {
    const stored = getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
    setLoading(false);
  }, []);

  // =====================================================
  // LOGIN (lưu token + role + user vào localStorage)
  // =====================================================
  const login = (apiData) => {
    const formatted = {
      token: apiData.accessToken,
      refreshToken: apiData.refreshToken,
      user: apiData.user,
      role: apiData.roles?.[0], // "ADMIN", "STAFF", "MEMBER"
    };

    setItem("user", JSON.stringify(formatted));
    setUser(formatted);
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const logout = () => {
    removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

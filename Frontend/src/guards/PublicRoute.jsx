import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    // Nếu đã login → chuyển vào dashboard đúng role
    if (user.role === "ADMIN") return <Navigate to="/dashboard/admin/dashboard" />;
    if (user.role === "STAFF") return <Navigate to="/dashboard/staff/dashboard" />;
    if (user.role === "MEMBER") return <Navigate to="/dashboard/member/dashboard" />;
    
  }

  return children;
}

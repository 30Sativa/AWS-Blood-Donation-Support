import type { JSX } from "react";
import { Navigate } from "react-router-dom";

type Role = "member" | "staff" | "admin";

interface PrivateRouteProps {
  children: JSX.Element; // component muon render
  allowedRoles?: Role[];  // role duoc phep truy cap
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") as Role | null;
// chưa login hoặc token không có -> về login
  if (!token) return <Navigate to="/auth/login" replace />;
// role không hợp lệ -> redirect về login
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

export default PrivateRoute;
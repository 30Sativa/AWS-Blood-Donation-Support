import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function DefaultRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Redirect theo role
  if (user.role === "ADMIN") 
    return <Navigate to="/dashboard/admin" replace />;

  if (user.role === "STAFF") 
    return <Navigate to="/dashboard/staff" replace />;

  if (user.role === "MEMBER") 
    return <Navigate to="/dashboard/member" replace />;

  return <Navigate to="/login" replace />;
}

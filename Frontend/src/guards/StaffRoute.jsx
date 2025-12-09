import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function StaffRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== "STAFF") {
    return <Navigate to="/" replace />;
  }

  return children;
}

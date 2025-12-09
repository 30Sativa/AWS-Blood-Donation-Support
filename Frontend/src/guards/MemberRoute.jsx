import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function MemberRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== "MEMBER" && user?.role !== "DONOR") {
    return <Navigate to="/" replace />;
  }

  return children;
}

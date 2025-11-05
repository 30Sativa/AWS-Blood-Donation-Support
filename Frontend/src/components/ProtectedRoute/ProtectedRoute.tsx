import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN, commonSettings } from '@/utils/setting';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const token = commonSettings.getStorage<string>(ACCESS_TOKEN);
  const isAuthenticated = !!token;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If route requires no auth (like login page), redirect to home if already logged in
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


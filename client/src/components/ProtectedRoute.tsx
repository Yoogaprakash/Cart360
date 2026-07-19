import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import type { UserRole } from "../lib/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "SuperAdmin" ? "/admin/dashboard" : "/app/dashboard"} replace />;
  }

  return <>{children}</>;
}

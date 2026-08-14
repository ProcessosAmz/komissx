import { Navigate, Outlet } from "react-router-dom";
import { FORBIDDEN_ROUTE } from "@/const/auth";
import { useAuth } from "@/hooks/useAuth.ts";
import type { AuthModule } from "@/types/auth";

interface PermissionRouteProps {
  modulo: AuthModule;
}

export function PermissionRoute({ modulo }: PermissionRouteProps) {
  const { canAccessModule } = useAuth();

  if (!canAccessModule(modulo)) {
    return <Navigate to={FORBIDDEN_ROUTE} replace />;
  }

  return <Outlet />;
}
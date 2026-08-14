import { Navigate, Outlet, useLocation } from "react-router-dom";

import { SessionLoader } from "@/components/common/sessionLoader";
import { POST_LOGIN_ROUTE } from "@/const/auth";
import { useAuth } from "@/hooks/useAuth.ts";

interface GuestLocationState {
  from?: string;
}

export function GuestRoute() {
  const { isAuthenticated, isPending } = useAuth();
  const location = useLocation();

  if (isPending) return <SessionLoader />;

  if (isAuthenticated) {
    const state = location.state as GuestLocationState | null;

    return <Navigate to={state?.from ?? POST_LOGIN_ROUTE} replace />;
  }

  return <Outlet />;
}
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SessionLoader } from "@/components/common/sessionLoader";
import { LOGIN_ROUTE } from "@/const/auth";
import { useAuth } from "@/hooks/useAuth";

export function PrivateRoute() {
  const { isAuthenticated, isPending } = useAuth();
  const location = useLocation();

  if (isPending) return <SessionLoader />;

  if (!isAuthenticated) {
    const attemptedRoute = `${location.pathname}${location.search}`;

    return (
      <Navigate to={LOGIN_ROUTE} replace state={{ from: attemptedRoute }} />
    );
  }

  return <Outlet />;
}
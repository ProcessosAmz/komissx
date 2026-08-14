import { Navigate } from "react-router-dom";

import { FORBIDDEN_ROUTE } from "@/const/auth";
import { useAuth } from "@/hooks/useAuth.ts";

export function RootRedirect() {
  const { canAccessModule } = useAuth();

  if (canAccessModule("producao")) return <Navigate to="dashboard" replace />;
  if (canAccessModule("academy")) return <Navigate to="academy" replace />;
  if (canAccessModule("fechamento")) return <Navigate to="fechamentos" replace />;
  if (canAccessModule("configuracoes")) {
    return <Navigate to="configuracoes" replace />;
  }

  return <Navigate to={FORBIDDEN_ROUTE} replace />;
}
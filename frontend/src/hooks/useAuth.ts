import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AUTH_SESSION_QUERY_KEY,
  LOGIN_ROUTE,
  SESSION_STALE_TIME_IN_MS,
} from "@/const/auth";
import { AuthService } from "@/service/auth";
import type { AuthModule } from "@/types/auth";
import { hasModulePermission } from "@/utils/permission";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isPending } = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: AuthService.me,
    staleTime: SESSION_STALE_TIME_IN_MS,
    retry: false,
  });

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      return;
    } finally {
      queryClient.clear();
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
      window.location.assign(LOGIN_ROUTE);
    }
  }, [queryClient]);

  const canAccessModule = useCallback(
    (modulo: AuthModule): boolean =>
      user ? hasModulePermission(modulo, user.role) : false,
    [user],
  );

  return {
    user: user ?? null,
    isAuthenticated: Boolean(user),
    isPending,
    logout,
    canAccessModule,
  };
};
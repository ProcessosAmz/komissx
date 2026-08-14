import { useQuery } from "@tanstack/react-query";
import { UsersService } from "@/service/userService";
import type { FiltroUsuarios } from "@/types/filtro";

export function useUsers(filters: FiltroUsuarios = {}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => UsersService.findAll(filters),
  });
}
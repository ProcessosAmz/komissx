import { useQuery } from "@tanstack/react-query";
import { RolesService } from "@/service/rolesService";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => RolesService.findAll(),
  });
}
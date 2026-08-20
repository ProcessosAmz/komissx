import { useQuery } from "@tanstack/react-query";
import { RolesService } from "@/service/rolesService";

export function useRoles(input: { search?: string } = {}) {
  return useQuery({
    queryKey: ["roles", input],
    queryFn: () => RolesService.findAll(input),
  });
}
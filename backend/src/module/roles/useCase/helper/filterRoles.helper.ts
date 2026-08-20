import { HIERARCHY_ROLE_NAMES } from "@/module/users/const/hierarchyRoleName.const";
import { Role } from "@/module/roles/entities/role.entity";

export function orderByHierarchy(roles: Role[]): Role[] {
  return HIERARCHY_ROLE_NAMES.flatMap((roleName) =>
    roles.filter((role) => role.name === roleName),
  );
}

export function filterBySearch(roles: Role[], search?: string): Role[] {
  const normalizedSearch = search?.trim().toUpperCase();

  if (!normalizedSearch) {
    return roles;
  }

  return roles.filter((role) => {
    const roleName = role.name.toUpperCase();
    return roleName.includes("SUPERVISOR") || roleName.includes(normalizedSearch);
  });
}
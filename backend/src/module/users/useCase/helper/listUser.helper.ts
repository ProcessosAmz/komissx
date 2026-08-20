import { FilterUsersDto } from "@/module/users/dto";
import { Users } from "@/module/users/entities/users.entity";
import { UserListItem } from "@/module/users/types/user";

export function toListItem(user: Users): UserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    hubsoftId: user.hubsoftId,
    roleId: user.roleId,
    roleName: user.role?.name ?? "",
    empresaId: user.empresaId,
    empresaName: user.empresa?.name ?? "",
    unidadeId: user.unidadeId,
    unidadeName: user.unidade?.name ?? "",
    estadoId: user.unidade?.estadoId ?? null,
    estadoName: user.unidade?.estado?.name ?? null,
    supervisorId: user.supervisorId,
    participaFechamento: user.participaFechamento,
    active: user.active,
  };
}

export function applyFilters(
    users: UserListItem[],
    filters: FilterUsersDto,
  ): UserListItem[] {
    const search = filters.search?.trim().toUpperCase();
  
    return users.filter((user) => {
      switch (true) {
        case isExcludedFromHierarchy(user.roleName):
        case Boolean(filters.empresaId && user.empresaId !== filters.empresaId):
        case Boolean(filters.unidadeId && user.unidadeId !== filters.unidadeId):
        case Boolean(filters.estadoId && user.estadoId !== filters.estadoId):
        case Boolean(search && !user.name.toUpperCase().includes(search)):
          return false;
        default:
          return true;
      }
    });
  }

export function isSupervisor(roleName: string) {
  return roleName.toUpperCase().includes("SUPERVISOR");
}

export function isExcludedFromHierarchy(roleName: string) {
  const normalized = roleName.toUpperCase().trim();

  switch (normalized) {
    case "ADMIN":
    case "GERENTE":
      return true;
    default:
      return false;
  }
}

export function buildTree(users: UserListItem[]): UserListItem[] {
  const nodesById = new Map(
    users.map((user) => [user.id, { ...user, children: [] as UserListItem[] }]),
  );
  const roots: UserListItem[] = [];

  nodesById.forEach((node) => {
    const parent = node.supervisorId
      ? nodesById.get(node.supervisorId)
      : undefined;

    if (parent) {
      parent.children?.push(node);
      return;
    }

    if (!isSupervisor(node.roleName)) {
      return;
    }

    roots.push(node);
  });

  return roots;
}
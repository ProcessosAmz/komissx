import type { HierarquiaNode } from "@/types/cargo";
import type { UserApiNode } from "@/types/filtro";
import type { UpdateUserFormData } from "@/utils/validators/user";
import {
  coletarIdsDescendentes,
  flattenUsers,
  isLiderRole,
  isSupervisorRole,
} from "@/utils/hierarquia";

export function montarPayloadMoverUsuario(
  usuario: HierarquiaNode,
  supervisorId: string,
): UpdateUserFormData {
  return {
    name: usuario.nome,
    email: usuario.email,
    password: undefined,
    hubsoftId: usuario.idHubsoft ? Number(usuario.idHubsoft) : undefined,
    roleId: usuario.roleId,
    empresaId: usuario.empresaId,
    unidadeId: usuario.unidadeId,
    supervisorId,
    participaFechamento: usuario.participaFechamento,
    active: true,
  };
}

export function montarPayloadMoverUsuarioApi(
  usuario: UserApiNode,
  supervisorId: string,
): UpdateUserFormData {
  return {
    name: usuario.name,
    email: usuario.email,
    password: undefined,
    hubsoftId: usuario.hubsoftId ?? undefined,
    roleId: usuario.roleId,
    empresaId: usuario.empresaId,
    unidadeId: usuario.unidadeId,
    supervisorId,
    participaFechamento: usuario.participaFechamento,
    active: usuario.active,
  };
}

export function listarDestinosMove(
  usuario: HierarquiaNode,
  arvore: UserApiNode[],
): UserApiNode[] {
  const idsBloqueados = new Set([
    usuario.id,
    ...coletarIdsDescendentes(usuario),
  ]);

  const colaboradores = flattenUsers(arvore).filter(
    (colaborador) =>
      !idsBloqueados.has(colaborador.id) && colaborador.id !== usuario.supervisorId,
  );

  if (isSupervisorRole(usuario.cargo)) {
    return [];
  }

  if (isLiderRole(usuario.cargo)) {
    return colaboradores.filter((colaborador) =>
      isSupervisorRole(colaborador.roleName),
    );
  }

  return colaboradores.filter(
    (colaborador) =>
      isLiderRole(colaborador.roleName) ||
      isSupervisorRole(colaborador.roleName),
  );
}

export function rotuloDestinoMove(usuario: HierarquiaNode) {
  if (isLiderRole(usuario.cargo)) {
    return "supervisor";
  }

  return "líder ou supervisor";
}
import type { Cargo, HierarquiaNode } from "@/types/cargo";
import type { UserApiNode } from "@/types/filtro";

const CARGO_ORDEM: Record<Cargo, number> = {
  SUPERVISOR: 0,
  LIDER: 1,
  BACKOFFICE: 2,
  RECEPCAO: 3,
  INTERNO: 4,
  "COMERCIAL INTERNO": 5,
  "COMERCIAL EXTERNO": 6,
  "REGIONAL INTERNO": 7,
  "REGIONAL EXTERNO": 8,
  "REGIONAL EXTERNO PA": 9,
  TECNICO: 10,
  AUTONOMO: 11,
};

export function getIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function cargoBadgeClass(cargo: Cargo) {
  switch (cargo) {
    case "SUPERVISOR":
      return "bg-indigo-600/20 text-indigo-300 border-indigo-500/30";
    case "LIDER":
      return "bg-slate-700/60 text-slate-300 border-slate-600/50";
    case "RECEPCAO":
      return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30";
    case "INTERNO":
      return "bg-sky-500/20 text-sky-300 border-sky-500/30";
    case "COMERCIAL INTERNO":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    case "COMERCIAL EXTERNO":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "BACKOFFICE":
      return "bg-violet-500/20 text-violet-300 border-violet-500/30";
    case "REGIONAL INTERNO":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "REGIONAL EXTERNO":
      return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    case "REGIONAL EXTERNO PA":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    default:
      return "bg-transparent text-slate-500 border-slate-700/40";
  }
}

export function contarNos(nos: HierarquiaNode[]): number {
  return nos.reduce(
    (total, no) => total + 1 + contarNos(no.children ?? []),
    0,
  );
}

export function encontrarNo(
  nos: HierarquiaNode[],
  id: string,
): HierarquiaNode | null {
  for (const no of nos) {
    if (no.id === id) return no;
    const filho = encontrarNo(no.children ?? [], id);
    if (filho) return filho;
  }
  return null;
}

export function encontrarCaminho(
  nos: HierarquiaNode[],
  id: string,
  caminho: string[] = [],
): string[] | null {
  for (const no of nos) {
    const caminhoAtual = [...caminho, no.id];

    if (no.id === id) {
      return caminhoAtual;
    }

    const caminhoFilho = encontrarCaminho(no.children ?? [], id, caminhoAtual);
    if (caminhoFilho) {
      return caminhoFilho;
    }
  }

  return null;
}

function mapCargo(roleName: string): Cargo {
  const normalized = roleName.toUpperCase();

  switch (true) {
    case normalized.includes("SUPERVISOR"):
      return "SUPERVISOR";
    case normalized.includes("LIDER"):
    case normalized.includes("LÍDER"):
      return "LIDER";
    case normalized.includes("BACKOFFICE"):
      return "BACKOFFICE";
    case normalized.includes("RECEPCAO"):
    case normalized.includes("RECEPÇÃO"):
      return "RECEPCAO";
    case normalized.includes("COMERCIAL INTERNO"):
      return "COMERCIAL INTERNO";
    case normalized.includes("COMERCIAL EXTERNO"):
      return "COMERCIAL EXTERNO";
    case normalized.includes("REGIONAL INTERNO"):
      return "REGIONAL INTERNO";
    case normalized.includes("REGIONAL EXTERNO PA"):
      return "REGIONAL EXTERNO PA";
    case normalized.includes("REGIONAL EXTERNO"):
      return "REGIONAL EXTERNO";
    case normalized === "INTERNO":
      return "INTERNO";
    case normalized.includes("AUTONOMO"):
    case normalized.includes("AUTÔNOMO"):
      return "AUTONOMO";
    default:
      return "TECNICO";
  }
}

export function flattenUsers(nodes: UserApiNode[]): UserApiNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenUsers(node.children ?? []),
  ]);
}

function ordenarPorCargo(nos: HierarquiaNode[]): HierarquiaNode[] {
  return [...nos].sort((primeiro, segundo) => {
    const ordemCargo =
      (CARGO_ORDEM[primeiro.cargo] ?? 99) - (CARGO_ORDEM[segundo.cargo] ?? 99);

    if (ordemCargo !== 0) {
      return ordemCargo;
    }

    return primeiro.nome.localeCompare(segundo.nome, "pt-BR");
  });
}

export function isSupervisorRole(roleName: string) {
  return roleName.toUpperCase().includes("SUPERVISOR");
}

export function isLiderRole(roleName: string) {
  const normalized = roleName.toUpperCase();
  return normalized.includes("LIDER") || normalized.includes("LÍDER");
}

export function coletarIdsDescendentes(no: HierarquiaNode): string[] {
  return (no.children ?? []).flatMap((filho) => [
    filho.id,
    ...coletarIdsDescendentes(filho),
  ]);
}

function isExcludedRole(roleName: string) {
  switch (roleName.toUpperCase()) {
    case "ADMIN":
    case "GERENTE":
      return true;
    default:
      return false;
  }
}

function mapNodes(
  nodes: UserApiNode[],
  onlySupervisors: boolean,
): HierarquiaNode[] {
  const filteredNodes = nodes.filter((node) => {
    if (isExcludedRole(node.roleName)) {
      return false;
    }

    if (onlySupervisors) {
      return isSupervisorRole(node.roleName);
    }

    return true;
  });

  const mapped = filteredNodes.map((node) => ({
    id: node.id,
    nome: node.name,
    email: node.email,
    cargo: mapCargo(node.roleName),
    roleId: node.roleId,
    empresaId: node.empresaId,
    empresaName: node.empresaName,
    unidadeId: node.unidadeId,
    unidadeName: node.unidadeName,
    supervisorId: node.supervisorId,
    operadora: node.empresaName,
    regional: node.unidadeName,
    idHubsoft: node.hubsoftId ? String(node.hubsoftId) : "",
    participaFechamento: node.participaFechamento,
    children: node.children ? mapNodes(node.children, false) : undefined,
  }));

  return ordenarPorCargo(mapped);
}

export function mapUserApiToHierarquia(nodes: UserApiNode[]): HierarquiaNode[] {
  return mapNodes(nodes, true);
}
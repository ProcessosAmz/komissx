import type { Cargo, HierarquiaNode } from "@/types/cargo";
import type { UserApiNode } from "@/types/filtro";

const CARGO_ORDEM: Record<Cargo, number> = {
  SUPERVISOR: 0,
  LIDER: 1,
  BACKOFFICE: 2,
  "COMERCIAL INTERNO": 3,
  "COMERCIAL EXTERNO": 4,
  "REGIONAL INTERNO": 5,
  "REGIONAL EXTERNO": 6,
  TECNICO: 7,
  AUTONOMO: 8,
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
  if (cargo === "SUPERVISOR") {
    return "bg-indigo-600/20 text-indigo-300 border-indigo-500/30";
  }
  if (cargo === "LIDER") {
    return "bg-slate-700/60 text-slate-300 border-slate-600/50";
  }
  if (cargo === "COMERCIAL INTERNO") {
    return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
  }
  if (cargo === "COMERCIAL EXTERNO") {
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  }
  if (cargo === "BACKOFFICE") {
    return "bg-violet-500/20 text-violet-300 border-violet-500/30";
  }
  if (cargo === "REGIONAL INTERNO") {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  }
  if (cargo === "REGIONAL EXTERNO") {
    return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  }
  return "bg-transparent text-slate-500 border-slate-700/40";
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

function mapCargo(roleName: string): Cargo {
  const normalized = roleName.toUpperCase();

  if (normalized.includes("SUPERVISOR")) return "SUPERVISOR";
  if (normalized.includes("LIDER") || normalized.includes("LÍDER")) return "LIDER";
  if (normalized.includes("BACKOFFICE")) return "BACKOFFICE";
  if (normalized.includes("COMERCIAL INTERNO")) return "COMERCIAL INTERNO";
  if (normalized.includes("COMERCIAL EXTERNO")) return "COMERCIAL EXTERNO";
  if (normalized.includes("REGIONAL INTERNO")) return "REGIONAL INTERNO";
  if (normalized.includes("REGIONAL EXTERNO")) return "REGIONAL EXTERNO";
  if (normalized.includes("AUTONOMO") || normalized.includes("AUTÔNOMO")) return "AUTONOMO";

  return "TECNICO";
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

export function mapUserApiToHierarquia(nodes: UserApiNode[]): HierarquiaNode[] {
  const mapped = nodes.map((node) => ({
    id: node.id,
    nome: node.name,
    email: node.email,
    cargo: mapCargo(node.roleName),
    operadora: node.empresaName,
    regional: node.unidadeName,
    idHubsoft: node.hubsoftId ? String(node.hubsoftId) : "",
    participaFechamento: node.participaFechamento,
    children: node.children
      ? mapUserApiToHierarquia(node.children)
      : undefined,
  }));

  return ordenarPorCargo(mapped);
}
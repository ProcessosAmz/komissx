import type { Cargo, HierarquiaNode } from "@/types/cargo";
import type { UserApiNode } from "@/types/filtro";

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
  if (normalized.includes("AUTONOMO") || normalized.includes("AUTÔNOMO")) return "AUTONOMO";
  return "TECNICO";
}

export function mapUserApiToHierarquia(nodes: UserApiNode[]): HierarquiaNode[] {
  return nodes.map((node) => ({
    id: node.id,
    nome: node.name,
    email: node.email,
    cargo: mapCargo(node.roleName),
    operadora: node.empresaName,
    regional: node.unidadeName,
    idHubsoft: node.hubsoftId ? String(node.hubsoftId) : "",
    participaFechamento: node.participaFechamento,
    children: node.children ? mapUserApiToHierarquia(node.children) : undefined,
  }));
}
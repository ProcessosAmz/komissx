import type { Cargo, HierarquiaNode } from "@/types/cargo";

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
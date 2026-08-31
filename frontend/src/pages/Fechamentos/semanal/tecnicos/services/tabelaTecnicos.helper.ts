import type { TecnicoRowViewModel } from "@/pages/Fechamentos/types";

export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const statusAuditoriaNaLista = (os: TecnicoRowViewModel): string => {
  if (os.status_financeiro === "PAGO" && os.valor_a_pagar > 0) {
    return os.status_auditoria.trim() || "APROVADO";
  }

  if (os.status_auditoria.trim().toUpperCase() === "REPROVADO") {
    return "REPROVADO";
  }

  return "Pendente auditoria";
};

export const classeStatusAuditoria = (rotulo: string): string => {
  if (rotulo === "APROVADO") {
    return "bg-emerald-500/10 text-emerald-400";
  }

  if (rotulo === "REPROVADO") {
    return "bg-red-500/10 text-red-400";
  }

  if (rotulo === "Pendente auditoria") {
    return "bg-amber-500/10 text-amber-300";
  }

  return "bg-slate-800/80 text-slate-400";
};

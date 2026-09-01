import type { StatusAuditoria } from "@/pages/Fechamentos/types";

export const STATUS_AUDITORIA_FORM = [
  "APROVADO",
  "PENDENTE",
  "REPROVADO",
] as const satisfies readonly StatusAuditoria[];

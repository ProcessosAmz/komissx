import { STATUS_AUDITORIA } from "@/module/reports/constants/statusAuditoria.constants";

export type StatusAuditoriaInstalacao = (typeof STATUS_AUDITORIA)[number];

export type StatusAuditoriaResposta = StatusAuditoriaInstalacao | "";

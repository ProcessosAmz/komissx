import type { StatusAuditoria } from "@/pages/Fechamentos/types";

export type FormularioNovaOs = {
  codigoCliente: string;
  nomeCliente: string;
  numeroOs: string;
  tecnicoId: string;
  statusAuditoria: StatusAuditoria;
  cidade: string;
  estado: string;
  dataTermino: string;
};

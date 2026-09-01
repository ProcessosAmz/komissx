import type { EmpresaFechamento } from "@/types/tecnicos";
import type { StatusAuditoria } from "@/pages/Fechamentos/types";

export type DadosNovaOrdemServico = {
  codigoCliente: string;
  nomeCliente: string;
  numeroOs: string;
  tecnicoId: string;
  tecnicoNome: string;
  statusAuditoria: StatusAuditoria;
  cidade: string;
  estado: string;
  dataTermino: string;
  empresa: EmpresaFechamento;
};

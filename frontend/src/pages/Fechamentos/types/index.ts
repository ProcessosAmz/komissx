export interface HierarchyBranch {
  supervisores: string[];
  lideres: string[];
}

export interface FechamentoSemanalRules {
  tecnicos_terceirizados: Record<string, number>;
  retirada_estado: Record<string, number>;
  autonomos: {
    valor_padrao: number;
    excecoes: Record<string, number>;
  };
}

export interface RuleEngineConfig {
  hierarquia: Record<string, Record<string, HierarchyBranch>>;
  fechamento_semanal: FechamentoSemanalRules;
  fechamento_mensal: Record<string, unknown>;
}

export type StatusAuditoria =
  | ""
  | "PENDENTE"
  | "APROVADO"
  | "NC APROVADO"
  | "REPROVADO";
export type StatusFinanceiro = "PAGO" | "-";

export interface OrdemServico {
  id: string;
  codigo_cliente: string;
  nome_cliente: string;
  numero_ordem_servico: string;
  usuario_fechamento: string;
  usuario_fechamento_limpo: string;
  usuario_abertura: string;
  tipo_ordem_servico: string;
  data_termino_executado: string;
  cidade: string;
  estado: string;
  bairro: string;
  motivo_fechamento: string;
  etapa_instalacao: string;
  status_instalacao: string;
  motivo_instalacao: string;
  status_auditoria: StatusAuditoria;
  conta: "amazonet" | "mania";
  tecnico_id?: string | null;
}

export interface TecnicoRowViewModel extends OrdemServico {
  status_financeiro: StatusFinanceiro;
  valor_base: number;
  valor_a_pagar: number;
}

export interface ResumoFechamentoDTO {
  totalReceber: number;
  totalOS: number;
  aprovadas: number;
  reprovadas: number;
  dataPagamento: string;
  tecnico: string;
  periodo: string;
}

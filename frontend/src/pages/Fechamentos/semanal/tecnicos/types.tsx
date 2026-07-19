// src/pages/Fechamentos/tecnico/types.ts

export interface RegrasGlobais {
  hierarquia?: Record<string, any>;
  fechamento_semanal?: {
    tecnicos_terceirizados?: Record<string, number>;
    retirada_estado?: Record<string, number>;
    autonomos?: {
      valor_padrao: number;
      excecoes: Record<string, number>;
    };
  };
  fechamento_mensal?: Record<string, any>;
}

export interface OrdemServico {
  id: string;
  codigo_cliente: string;
  numero_ordem_servico: string;
  usuario_fechamento: string;
  usuario_fechamento_limpo: string;
  usuario_abertura: string;
  tipo_ordem_servico: string;
  data_termino_executado: string;
  status_auditoria: 'APROVADO' | 'NC APROVADO' | 'REPROVADO' | '';
  conta: 'amazonet' | 'mania';
  status_financeiro?: 'PAGO' | '-';
  valor_base?: number;
  valor_a_pagar?: number;
}
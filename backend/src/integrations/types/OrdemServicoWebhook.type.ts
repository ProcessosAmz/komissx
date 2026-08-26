export type OrdemServicoWebhook = {
  body: {
    id_ordem_servico: number;
    id_tipo_ordem_servico: number;
    descricao_abertura: string;
    descricao_servico: string;
    descricao_fechamento: string | null;
    duracao: string;
    gera_custo: boolean | null;
    valor_custo: number | null;
    id_forma_cobranca: number | null;
    numero_ordem_servico: string;
    id_usuario_abertura: number;
    id_usuario_fechamento: number | null;
    data_cadastro: string;
    status: string;
    status_fechamento: string | null;
    id_cliente_servico: number;
    id_atendimento: number;
    id_prioridade: number;
    data_inicio_programado: string;
    data_termino_programado: string;
    data_inicio_executado: string | null;
    data_termino_executado: string | null;
    id_pop: number | null;
    id_prospecto: number | null;
  };
};

export type HubsoftAtendimentoCliente = {
  codigo_cliente: number;
  nome_razaosocial: string;
  cpf_cnpj: string;
};

export type HubsoftAtendimentoServico = {
  id_cliente_servico: number;
  numero_plano: number;
  nome: string;
  valor: number;
  status: string;
  status_prefixo: string;
  id_motivo_cancelamento: number | null;
  motivo_cancelamento: string | null;
  motivo_cancelamento_prefixo: string | null;
  anotacoes: string | null;
};

export type HubsoftAtendimento = {
  id_atendimento: number;
  rascunho: string | null;
  protocolo: string;
  descricao_abertura: string;
  descricao_fechamento: string | null;
  tipo_atendimento:
    | string
    | {
        id_tipo_atendimento?: number;
        descricao?: string;
      };
  id_tipo_atendimento?: number | null;
  id_atendimento_status?: number | null;
  id_usuario_responsavel?: number | null;
  usuarios_responsaveis?: {
    id?: number;
    id_usuario?: number;
    name?: string;
    pivot?: {
      id_atendimento?: number;
      id_usuario?: number;
    };
  }[];
  id_usuario_abertura?: number | null;
  usuario_abertura?: string | { id?: number; name?: string };
  usuario_responsavel?: string | { id?: number; name?: string } | null;
  usuario_fechamento: string | null;
  data_cadastro: string;
  data_fechamento: string | null;
  setor_responsavel: string | null;
  status_fechamento: string | null;
  motivo_fechamento: string | null;
  status:
    | string
    | {
        descricao?: string;
        id_atendimento_status?: number;
      };
  id_cliente_servico?: number;
  cliente_servico?: {
    id_cliente_servico?: number;
    id_cliente?: number;
    cliente?: {
      codigo_cliente?: number;
      nome_razaosocial?: string;
    };
    servico?: {
      id_servico?: number;
      descricao?: string;
    };
  };
  atendimento_mensagem: unknown[];
  disponibilidade_atendimento: unknown[];
  destino: string;
  cliente: HubsoftAtendimentoCliente;
  servico?: HubsoftAtendimentoServico | null;
  pop: unknown | null;
  prospecto: unknown | null;
  ordens_servico: unknown[];
  atendimento_checklist: unknown[];
};

export type HubsoftCriarAtendimentoResponse =
  | {
      status: "success";
      msg: string;
      atendimento: HubsoftAtendimento;
    }
  | {
      status: "error";
      msg: string;
      errors: string[];
    };

export type HubsoftAtendimentoTodosQuery = {
  pagina: number;
  itens_por_pagina: number;
  data_inicio: string;
  data_fim: string;
  tipo_atendimento?: string;
  status_atendimento?: string;
  id_servico?: number;
  relacoes?: string;
  tipo_data?: "data_cadastro" | "data_fechamento";
};

export type HubsoftAtendimentoTodosResponse = {
  atendimentos?: HubsoftAtendimento[];
  total?: number;
  pagina?: number;
};

export type HubsoftTokenResponse = {
  access_token: string;
  expires_in: number;
};

export type HostTokenState = {
  accessToken: string;
  expiresAt: number;
};

export type CreateTicketResult = {
  message: string;
  duplicate?: boolean;
};

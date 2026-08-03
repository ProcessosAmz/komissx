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
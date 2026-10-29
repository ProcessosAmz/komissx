export type EmpresaComercial = "amazonet" | "mania";

export type VendaComercial = {
  id: string;
  tipo_ordem_servico: string;
  numero_ordem_servico: string;
  id_atendimento: string;
  codigo_cliente: string;
  nome_cliente: string;
  id_cliente: string;
  nome_servico: string;
  vendedor: string;
  vendedor_limpo: string;
  usuario_cadastro: string;
  status_atendimento: string;
  status_auditoria: string;
  motivo_fechamento: string;
  data_cadastro: string;
  data_termino_executado: string;
  valor_servico: number;
  conta: EmpresaComercial;
  colaborador_id: string | null;
  venda_do_lider: boolean;
  origem?: "metabase" | "manual";
  status_original?: string;
  justificativa_ajuste?: string;
  desconsiderada?: boolean;
};

export type VendaComercialManual = Omit<VendaComercial, "origem"> & {
  origem: "manual";
  justificativa_ajuste: string;
};

export type AjustesVendasComercial = {
  statusPorVenda: Record<string, string>;
  vendasDesconsideradas: Record<string, true>;
  vendasManuais: VendaComercialManual[];
};

export type ColaboradorComercial = {
  id: string;
  name: string;
  roleName: string;
  supervisorId: string | null;
  supervisorName: string | null;
  unidadeName: string;
  conta: EmpresaComercial;
  isLider: boolean;
  isSupervisor: boolean;
};

export type RelatorioVendasComercial = {
  data: VendaComercial[];
  colaboradores: ColaboradorComercial[];
  lider: ColaboradorComercial | null;
  message: string;
};

export type FiltrosVendasComercial = {
  dataInicio: string;
  dataFim: string;
  empresa?: EmpresaComercial;
  lider?: string;
};

export type ResumoVendasComercial = {
  quantidade: number;
  quantidadeDaEquipe: number;
  quantidadeDoLider: number;
  valorTotal: number;
  valorDaEquipe: number;
  valorDoLider: number;
  quantidadeElegivel: number;
  valorElegivel: number;
};

export type LinhaRelatorioComercial = {
  vendedor: string;
  conta: EmpresaComercial;
  unidade: string;
  categoriaComissao: string | null;
  quantidadeTotal: number;
  aprovados: number;
  aprovadosReanalise: number;
  quantidadeElegivel: number;
  valorElegivel: number;
  valorUnitarioComissao: number | null;
  comissao: number | null;
};

export type ModeloRelatorioComercial = {
  dataInicio: string;
  dataFim: string;
  empresa: EmpresaComercial | "";
  unidade: string;
  lideranca: string;
  supervisao: string;
  vendas: VendaComercial[];
  linhas: LinhaRelatorioComercial[];
  totalElegivel: number;
  valorElegivel: number;
  totalComissao: number;
  comissaoPendente: boolean;
};

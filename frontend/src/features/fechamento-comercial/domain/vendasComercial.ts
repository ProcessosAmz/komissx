import type {
  LinhaRelatorioComercial,
  ModeloRelatorioComercial,
  ResumoVendasComercial,
  VendaComercial,
} from "./types";

export const normalizarStatusComercial = (status: string): string => {
  const normalizado = status.trim().toLocaleUpperCase("pt-BR");
  return normalizado === "N.C APROVADO" || normalizado === "NC APROVADO"
    ? "APROVADO (REANÁLISE)"
    : normalizado;
};

export const statusComercialDisponiveis = (vendas: VendaComercial[]): string[] => {
  const status = new Set(vendas.map((venda) => normalizarStatusComercial(venda.status_auditoria)).filter(Boolean));
  status.add("PENDENTE");
  return Array.from(status).sort((a, b) => a.localeCompare(b, "pt-BR"));
};

export const vendaElegivelParaComissao = (venda: VendaComercial): boolean => {
  const status = normalizarStatusComercial(venda.status_auditoria);
  return status === "APROVADO" || status === "APROVADO (REANÁLISE)";
};

export const chaveVendaComercial = (venda: Pick<VendaComercial, "conta" | "id_atendimento" | "numero_ordem_servico" | "codigo_cliente">): string => {
  const atendimento = venda.id_atendimento.trim();
  if (atendimento) return `${venda.conta}:atendimento:${atendimento}`;

  return `${venda.conta}:os:${venda.numero_ordem_servico.trim()}:cliente:${venda.codigo_cliente.trim()}`;
};

export const filtrarVendas = (vendas: VendaComercial[], busca: string) => {
  const termo = busca.trim().toLocaleLowerCase();
  if (!termo) return vendas;
  return vendas.filter((venda) => [venda.numero_ordem_servico, venda.codigo_cliente, venda.nome_cliente, venda.vendedor_limpo, venda.nome_servico, venda.status_auditoria].join(" ").toLocaleLowerCase().includes(termo));
};

export const resumirVendas = (vendas: VendaComercial[]): ResumoVendasComercial => {
  const ativas = vendas.filter((venda) => !venda.desconsiderada);
  const doLider = ativas.filter((venda) => venda.venda_do_lider);
  const daEquipe = ativas.filter((venda) => !venda.venda_do_lider);
  const somar = (lista: VendaComercial[]) => lista.reduce((total, venda) => total + (Number(venda.valor_servico) || 0), 0);
  const elegiveis = ativas.filter(vendaElegivelParaComissao);
  return { quantidade: ativas.length, quantidadeDaEquipe: daEquipe.length, quantidadeDoLider: doLider.length, valorTotal: somar(ativas), valorDaEquipe: somar(daEquipe), valorDoLider: somar(doLider), quantidadeElegivel: elegiveis.length, valorElegivel: somar(elegiveis) };
};

export const montarModeloRelatorioComercial = (params: {
  dataInicio: string;
  dataFim: string;
  empresa: "amazonet" | "mania" | "";
  vendas: VendaComercial[];
  colaboradores?: { id: string; name: string }[];
  lideranca?: VendaComercial["vendedor"];
  supervisao?: string;
}): ModeloRelatorioComercial => {
  const porVendedor = new Map<string, LinhaRelatorioComercial>();
  const nomesPorColaborador = new Map(
    (params.colaboradores ?? []).map((colaborador) => [colaborador.id, colaborador.name]),
  );

  for (const venda of params.vendas.filter((item) => !item.desconsiderada)) {
    const vendedor = (venda.colaborador_id
      ? nomesPorColaborador.get(venda.colaborador_id)
      : undefined) || venda.vendedor_limpo || venda.vendedor || "Não identificado";
    const chave = `${venda.conta}:${vendedor}`;
    const linha = porVendedor.get(chave) ?? {
      vendedor,
      conta: venda.conta,
      quantidadeTotal: 0,
      aprovados: 0,
      aprovadosReanalise: 0,
      quantidadeElegivel: 0,
      valorElegivel: 0,
      comissao: null,
    };

    linha.quantidadeTotal += 1;
    const status = normalizarStatusComercial(venda.status_auditoria);
    if (status === "APROVADO") linha.aprovados += 1;
    if (status === "APROVADO (REANÁLISE)") linha.aprovadosReanalise += 1;
    if (vendaElegivelParaComissao(venda)) {
      linha.quantidadeElegivel += 1;
      linha.valorElegivel += Number(venda.valor_servico) || 0;
    }
    porVendedor.set(chave, linha);
  }

  const linhas = Array.from(porVendedor.values()).sort((a, b) => a.vendedor.localeCompare(b.vendedor, "pt-BR"));
  return {
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
    empresa: params.empresa,
    unidade: "Não informada",
    lideranca: params.lideranca ?? "Toda a estrutura",
    supervisao: params.supervisao ?? "Não informada",
    vendas: params.vendas,
    linhas,
    totalElegivel: linhas.reduce((total, linha) => total + linha.quantidadeElegivel, 0),
    valorElegivel: linhas.reduce((total, linha) => total + linha.valorElegivel, 0),
  };
};

export const formatarMoeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const formatarData = (valor: string) => {
  if (!valor) return "-";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR");
};

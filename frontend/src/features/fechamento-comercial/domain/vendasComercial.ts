import type { ColaboradorComercial, LinhaRelatorioComercial, ModeloRelatorioComercial, ResumoVendasComercial, VendaComercial } from "./types";
import type { ConfiguracaoMensal } from "@/config/configuracaoMensal";

type FaixaRegra = [number, number | null, number] | { inicio: number; fim: number | null; valor: number };

const normalizarChave = (valor: string): string => valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR");
const encontrarChave = (registro: Record<string, unknown> | undefined, chave: string): string | undefined => Object.keys(registro ?? {}).find((item) => normalizarChave(item) === normalizarChave(chave));
const unidadeDeMeta = (conta: string, unidade: string): string => {
  if (normalizarChave(conta) === "AMAZONET" && ["MATRIZ", "SEDE"].includes(normalizarChave(unidade))) return "MANAUS";
  return unidade;
};
const STATUS_APROVADO_REANALISE = "APROVADO (REAN\u00C1LISE)";

export const normalizarStatusComercial = (status: string): string => {
  const normalizado = status.trim().toLocaleUpperCase("pt-BR");
  return normalizado === "N.C APROVADO" || normalizado === "NC APROVADO" ? STATUS_APROVADO_REANALISE : normalizado;
};

export const categoriaComissaoPorCargo = (cargo: string): string | null => {
  const normalizado = normalizarChave(cargo);
  if (normalizado === "INTERNO" || normalizado === "COMERCIAL INTERNO") return "COMERCIAL_INTERNO";
  if (normalizado === "EXTERNO" || normalizado === "COMERCIAL EXTERNO") return "COMERCIAL_EXTERNO";
  if (normalizado === "RECEPCAO" || normalizado === "RECEPCAO UNIDADES") return "RECEPCAO";
  if (normalizado === "BACKOFFICE") return "BACKOFFICE";
  if (normalizado === "REGIONAL INTERNO" || normalizado === "REGIONAIS INTERNO") return "REGIONAL_INTERNO";
  if (normalizado === "REGIONAL EXTERNO") return "REGIONAL_EXTERNO";
  if (normalizado === "REGIONAL EXTERNO PA") return "REGIONAL_EXTERNO_PA";
  return null;
};

const faixaParaQuantidade = (faixas: unknown, quantidade: number): number | null => {
  if (!Array.isArray(faixas)) return null;
  for (const faixa of faixas as FaixaRegra[]) {
    const [inicio, fim, valor] = Array.isArray(faixa) ? faixa : [faixa.inicio, faixa.fim, faixa.valor];
    if (typeof inicio === "number" && (fim === null || typeof fim === "number") && typeof valor === "number" && quantidade >= inicio && (fim === null || quantidade <= fim)) return valor;
  }
  return null;
};

export const calcularComissaoIndividual = (params: { quantidadeElegivel: number; conta: string; unidade: string; categoria: string | null; configuracao?: ConfiguracaoMensal }): { valorUnitario: number | null; total: number | null } => {
  if (!params.categoria || !params.configuracao?.fechamento_mensal) return { valorUnitario: null, total: null };
  const fechamento = params.configuracao.fechamento_mensal as Record<string, Record<string, { metas?: Record<string, unknown> }>>;
  const empresaKey = encontrarChave(fechamento as Record<string, unknown>, params.conta);
  const empresa = empresaKey ? fechamento[empresaKey] : undefined;
  let unidadeBusca = unidadeDeMeta(params.conta, params.unidade);
  let categoriaBusca = params.categoria;
  if (params.categoria === "REGIONAL_EXTERNO_PA") {
    unidadeBusca = "PARA";
    categoriaBusca = "REGIONAL_EXTERNO";
  } else if (params.categoria === "REGIONAL_INTERNO" || params.categoria === "REGIONAL_EXTERNO") {
    unidadeBusca = params.conta.toLocaleUpperCase("pt-BR") === "AMAZONET" ? "AMAZONAS" : "MANAUS";
  }
  const unidadeKey = encontrarChave(empresa as Record<string, unknown> | undefined, unidadeBusca);
  const unidade = unidadeKey ? empresa?.[unidadeKey] : undefined;
  const categoriaKey = encontrarChave(unidade?.metas, categoriaBusca);
  if (params.categoria === "BACKOFFICE" && empresaKey) {
    const limite = normalizarChave(params.conta) === "AMAZONET" ? 120 : 100;
    const valorUnitario = params.quantidadeElegivel >= limite ? 2 : 1;
    return { valorUnitario, total: params.quantidadeElegivel * valorUnitario };
  }
  const valorUnitario = categoriaKey ? faixaParaQuantidade(unidade?.metas?.[categoriaKey], params.quantidadeElegivel) : null;
  return { valorUnitario, total: valorUnitario === null ? null : params.quantidadeElegivel * valorUnitario };
};

export const statusComercialDisponiveis = (vendas: VendaComercial[]): string[] => {
  const status = new Set(vendas.map((venda) => normalizarStatusComercial(venda.status_auditoria)).filter(Boolean)); status.add("PENDENTE"); return Array.from(status).sort((a, b) => a.localeCompare(b, "pt-BR"));
};
export const vendaElegivelParaComissao = (venda: VendaComercial): boolean => ["APROVADO", STATUS_APROVADO_REANALISE].includes(normalizarStatusComercial(venda.status_auditoria));
export const chaveVendaComercial = (venda: Pick<VendaComercial, "conta" | "id_atendimento" | "numero_ordem_servico" | "codigo_cliente">): string => {
  const atendimento = venda.id_atendimento.trim(); return atendimento ? `${venda.conta}:atendimento:${atendimento}` : `${venda.conta}:os:${venda.numero_ordem_servico.trim()}:cliente:${venda.codigo_cliente.trim()}`;
};
export const filtrarVendas = (vendas: VendaComercial[], busca: string) => {
  const termo = busca.trim().toLocaleLowerCase(); if (!termo) return vendas;
  return vendas.filter((venda) => [venda.numero_ordem_servico, venda.codigo_cliente, venda.nome_cliente, venda.vendedor_limpo, venda.nome_servico, venda.status_auditoria].join(" ").toLocaleLowerCase().includes(termo));
};
export const resumirVendas = (vendas: VendaComercial[]): ResumoVendasComercial => {
  const ativas = vendas.filter((venda) => !venda.desconsiderada); const doLider = ativas.filter((venda) => venda.venda_do_lider); const daEquipe = ativas.filter((venda) => !venda.venda_do_lider); const somar = (lista: VendaComercial[]) => lista.reduce((total, venda) => total + (Number(venda.valor_servico) || 0), 0); const elegiveis = ativas.filter(vendaElegivelParaComissao);
  return { quantidade: ativas.length, quantidadeDaEquipe: daEquipe.length, quantidadeDoLider: doLider.length, valorTotal: somar(ativas), valorDaEquipe: somar(daEquipe), valorDoLider: somar(doLider), quantidadeElegivel: elegiveis.length, valorElegivel: somar(elegiveis) };
};

export const montarModeloRelatorioComercial = (params: { dataInicio: string; dataFim: string; empresa: "amazonet" | "mania" | ""; vendas: VendaComercial[]; colaboradores?: ColaboradorComercial[]; lideranca?: VendaComercial["vendedor"]; supervisao?: string; configuracaoMensal?: ConfiguracaoMensal }): ModeloRelatorioComercial => {
  const porVendedor = new Map<string, LinhaRelatorioComercial>(); const colaboradoresPorId = new Map((params.colaboradores ?? []).map((colaborador) => [colaborador.id, colaborador]));
  for (const venda of params.vendas.filter((item) => !item.desconsiderada)) {
    const colaborador = venda.colaborador_id ? colaboradoresPorId.get(venda.colaborador_id) : undefined; const vendedor = colaborador?.name || venda.vendedor_limpo || venda.vendedor || "Não identificado"; const unidade = colaborador?.unidadeName || "Não informada"; const categoria = colaborador ? categoriaComissaoPorCargo(colaborador.roleName) : null; const chave = `${venda.conta}:${vendedor}:${categoria ?? "SEM_CATEGORIA"}`;
    const linha = porVendedor.get(chave) ?? { vendedor, conta: venda.conta, unidade, categoriaComissao: categoria, quantidadeTotal: 0, aprovados: 0, aprovadosReanalise: 0, quantidadeElegivel: 0, valorElegivel: 0, valorUnitarioComissao: null, comissao: null };
    linha.quantidadeTotal += 1; const status = normalizarStatusComercial(venda.status_auditoria); if (status === "APROVADO") linha.aprovados += 1; if (status === STATUS_APROVADO_REANALISE) linha.aprovadosReanalise += 1;
    if (vendaElegivelParaComissao(venda)) { linha.quantidadeElegivel += 1; linha.valorElegivel += Number(venda.valor_servico) || 0; const calculo = calcularComissaoIndividual({ quantidadeElegivel: linha.quantidadeElegivel, conta: linha.conta, unidade: linha.unidade, categoria: linha.categoriaComissao, configuracao: params.configuracaoMensal }); linha.valorUnitarioComissao = calculo.valorUnitario; linha.comissao = calculo.total; }
    porVendedor.set(chave, linha);
  }
  const linhas = Array.from(porVendedor.values()).sort((a, b) => {
    const categoria = (a.categoriaComissao ?? "ZZZ").localeCompare(b.categoriaComissao ?? "ZZZ", "pt-BR");
    return categoria || a.vendedor.localeCompare(b.vendedor, "pt-BR");
  });
  const unidades = Array.from(new Set(linhas.map((linha) => linha.unidade).filter(Boolean)));
  return { dataInicio: params.dataInicio, dataFim: params.dataFim, empresa: params.empresa, unidade: unidades.length === 1 ? unidades[0] : "Múltiplas", lideranca: params.lideranca ?? "Toda a estrutura", supervisao: params.supervisao ?? "Não informada", vendas: params.vendas, linhas, totalElegivel: linhas.reduce((total, linha) => total + linha.quantidadeElegivel, 0), valorElegivel: linhas.reduce((total, linha) => total + linha.valorElegivel, 0), totalComissao: linhas.reduce((total, linha) => total + (linha.comissao ?? 0), 0), comissaoPendente: linhas.some((linha) => linha.comissao === null && linha.quantidadeElegivel > 0) };
};

export const formatarMoeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const formatarData = (valor: string) => {
  if (!valor) return "-";
  const somenteData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (somenteData) return `${somenteData[3]}/${somenteData[2]}/${somenteData[1]}`;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR");
};

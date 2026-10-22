import { useCallback, useMemo, useReducer } from "react";
import type {
  AjustesVendasComercial,
  VendaComercial,
  VendaComercialManual,
} from "../domain/types";
import { chaveVendaComercial, normalizarStatusComercial } from "../domain/vendasComercial";

type Estado = AjustesVendasComercial & { contexto: string };
type Acao =
  | { type: "status"; contexto: string; id: string; status: string }
  | { type: "desconsiderar"; contexto: string; id: string }
  | { type: "restaurar"; contexto: string; id: string }
  | { type: "adicionar"; contexto: string; venda: VendaComercialManual }
  | { type: "remover-manual"; contexto: string; id: string };

const vazio = (contexto: string): Estado => ({
  contexto,
  statusPorVenda: {},
  vendasDesconsideradas: {},
  vendasManuais: [],
});

const reducer = (estado: Estado, acao: Acao): Estado => {
  const base = estado.contexto === acao.contexto ? estado : vazio(acao.contexto);
  if (acao.type === "status") return { ...base, statusPorVenda: { ...base.statusPorVenda, [acao.id]: acao.status } };
  if (acao.type === "desconsiderar") return { ...base, vendasDesconsideradas: { ...base.vendasDesconsideradas, [acao.id]: true } };
  if (acao.type === "restaurar") {
    const vendasDesconsideradas = { ...base.vendasDesconsideradas };
    const statusPorVenda = { ...base.statusPorVenda };
    delete vendasDesconsideradas[acao.id];
    delete statusPorVenda[acao.id];
    return { ...base, vendasDesconsideradas, statusPorVenda };
  }
  if (acao.type === "adicionar") return { ...base, vendasManuais: [...base.vendasManuais, acao.venda] };
  return { ...base, vendasManuais: base.vendasManuais.filter((venda) => venda.id !== acao.id) };
};

export type VendaManualInput = {
  empresa: VendaComercial["conta"];
  vendedor: string;
  colaboradorId: string;
  numeroOrdemServico: string;
  codigoCliente: string;
  nomeCliente: string;
  nomeServico: string;
  valorServico: string;
  dataCadastro: string;
  justificativa: string;
};

export function useAjustesVendasComercial(originais: VendaComercial[], contexto: string, liderId: string) {
  const [estado, dispatch] = useReducer(reducer, contexto, vazio);
  const ativo = estado.contexto === contexto ? estado : vazio(contexto);

  const vendasAjustadas = useMemo(() => {
    const ids = new Set(originais.map(chaveVendaComercial));
    const vendas = originais
      .map((venda) => {
        const id = chaveVendaComercial(venda);
        const status = ativo.statusPorVenda[id] ?? ativo.statusPorVenda[venda.id];
        const desconsiderada = Boolean(ativo.vendasDesconsideradas[id] || ativo.vendasDesconsideradas[venda.id]);
        const statusOriginal = venda.status_auditoria;
        const statusAtual = normalizarStatusComercial(status ?? statusOriginal);
        return { ...venda, origem: venda.origem ?? "metabase", status_auditoria: statusAtual, ...(statusAtual !== statusOriginal ? { status_original: statusOriginal } : {}), desconsiderada };
      });

    return [...vendas, ...ativo.vendasManuais.filter((venda) => !ids.has(chaveVendaComercial(venda)))]
      .map((venda) => ({ ...venda, venda_do_lider: Boolean(liderId) && venda.colaborador_id === liderId }));
  }, [ativo, originais, liderId]);

  const alterarStatus = useCallback((venda: VendaComercial, status: string) => {
    dispatch({ type: "status", contexto, id: chaveVendaComercial(venda), status });
  }, [contexto]);
  const desconsiderar = useCallback((venda: VendaComercial) => dispatch({ type: "desconsiderar", contexto, id: chaveVendaComercial(venda) }), [contexto]);
  const restaurar = useCallback((venda: VendaComercial) => dispatch({ type: "restaurar", contexto, id: chaveVendaComercial(venda) }), [contexto]);
  const removerManual = useCallback((id: string) => dispatch({ type: "remover-manual", contexto, id }), [contexto]);
  const adicionarManual = useCallback((input: VendaManualInput): boolean => {
    const identidade = `${input.empresa}:os:${input.numeroOrdemServico.trim()}:cliente:${input.codigoCliente.trim()}`;
    if (vendasAjustadas.some((venda) => !venda.desconsiderada && chaveVendaComercial(venda) === identidade)) return false;

    const venda: VendaComercialManual = {
      id: `manual-${crypto.randomUUID()}`,
      tipo_ordem_servico: "VENDA MANUAL",
      numero_ordem_servico: input.numeroOrdemServico.trim(),
      id_atendimento: "",
      codigo_cliente: input.codigoCliente.trim(),
      nome_cliente: input.nomeCliente.trim(),
      id_cliente: "",
      nome_servico: input.nomeServico.trim(),
      vendedor: input.vendedor.trim(),
      vendedor_limpo: input.vendedor.trim(),
      usuario_cadastro: "MANUAL",
      status_atendimento: "",
      status_auditoria: "PENDENTE",
      motivo_fechamento: "INCLUSÃO MANUAL",
      data_cadastro: input.dataCadastro,
      data_termino_executado: input.dataCadastro,
      valor_servico: Number(input.valorServico.replace(",", ".")) || 0,
      conta: input.empresa,
      colaborador_id: input.colaboradorId || null,
      venda_do_lider: Boolean(liderId) && input.colaboradorId === liderId,
      origem: "manual",
      justificativa_ajuste: input.justificativa.trim(),
    };
    dispatch({ type: "adicionar", contexto, venda });
    return true;
  }, [contexto, liderId, vendasAjustadas]);

  return { vendasAjustadas, alterarStatus, desconsiderar, restaurar, adicionarManual, removerManual };
}

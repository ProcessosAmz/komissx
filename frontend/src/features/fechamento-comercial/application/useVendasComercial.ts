import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buscarVendasComercial } from "../infrastructure/vendasComercialApi";
import { filtrarVendas, resumirVendas } from "../domain/vendasComercial";
import type { ColaboradorComercial, EmpresaComercial, VendaComercial } from "../domain/types";
import { useAjustesVendasComercial } from "./useAjustesVendasComercial";

const hoje = new Date();
const iso = (data: Date) => data.toISOString().slice(0, 10);
const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

const mensagemErro = (error: unknown) => {
  const resposta = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return resposta ?? (error instanceof Error ? error.message : "Não foi possível carregar as vendas comerciais.");
};

export function useVendasComercial() {
  const [dataInicio, setDataInicio] = useState(iso(primeiroDiaDoMes));
  const [dataFim, setDataFim] = useState(iso(hoje));
  const [empresa, setEmpresa] = useState<EmpresaComercial | "">("");
  const [liderId, setLiderId] = useState("");
  const [busca, setBusca] = useState("");
  const [vendas, setVendas] = useState<VendaComercial[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorComercial[]>([]);
  const [lider, setLider] = useState<ColaboradorComercial | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const consultaAtual = useRef(0);
  const contexto = `${dataInicio}|${dataFim}|${empresa}|${liderId}`;

  const consultar = useCallback(async () => {
    const idConsulta = ++consultaAtual.current;
    setLoading(true);
    setErro("");
    try {
      const resultado = await buscarVendasComercial({ dataInicio, dataFim, ...(empresa ? { empresa } : {}), ...(liderId ? { lider: liderId } : {}) });

      if (idConsulta !== consultaAtual.current) return;

      setVendas(resultado.data); setColaboradores(resultado.colaboradores); setLider(resultado.lider);
    } catch (error) {
      if (idConsulta !== consultaAtual.current) return;

      setErro(mensagemErro(error)); setVendas([]);
    } finally {
      if (idConsulta === consultaAtual.current) setLoading(false);
    }
  }, [dataFim, dataInicio, empresa, liderId]);

  // A consulta inicial sincroniza a tela com a API assim que a feature é montada.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void consultar(); }, [consultar]);
  const ajustes = useAjustesVendasComercial(vendas, contexto, liderId);
  const dados = useMemo(() => filtrarVendas(ajustes.vendasAjustadas, busca), [ajustes.vendasAjustadas, busca]);
  const resumo = useMemo(() => resumirVendas(dados), [dados]);
  const opcoesLideranca = useMemo(() => {
    const opcoes = colaboradores.filter((colaborador) => colaborador.isLider || colaborador.isSupervisor);

    if (!lider || opcoes.some((opcao) => opcao.id === lider.id)) return opcoes;

    return [lider, ...opcoes];
  }, [colaboradores, lider]);

  const colaboradoresDisponiveis = useMemo(() => {
    const todos = lider ? [lider, ...colaboradores] : colaboradores;
    return todos.filter((colaborador, index, lista) => lista.findIndex((item) => item.id === colaborador.id) === index);
  }, [colaboradores, lider]);

  return { dataInicio, dataFim, empresa, liderId, busca, dados, vendasOriginais: vendas, resumo, lider, colaboradores: colaboradoresDisponiveis, opcoesLideranca, loading, erro, setDataInicio, setDataFim, setEmpresa, setLiderId, setBusca, consultar, ...ajustes };
}

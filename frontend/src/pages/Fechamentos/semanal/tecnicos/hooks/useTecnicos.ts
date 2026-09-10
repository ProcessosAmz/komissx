import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ConfigService } from "@/config/ConfigService";
import { ReportsService } from "@/service/reportsService";
import type {
  RelatorioTecnicoResponse,
  TecnicoFechamento,
} from "@/types/reports";
import {
  contarListagem,
  filtrarListagem,
  processarEDeduplicar,
  quantidadePorCliente as contarQuantidadePorCliente,
} from "@/pages/Fechamentos/semanal/tecnicos/services/tecnico.helper";
import { getPeriodoFechamentoSemanal } from "@/pages/Fechamentos/semanal/tecnicos/services/periodoFechamento.helper";
import {
  aplicarFiltroNaQuery,
  isDataIso,
  lerEmpresaDaQuery,
  lerListagemDaQuery,
  lerTecnicoDaQuery,
} from "@/pages/Fechamentos/semanal/tecnicos/services/queryTecnicos.helper";
import {
  DEBOUNCE_CONSULTA_MS,
  QUERY_TECNICOS,
} from "@/pages/Fechamentos/semanal/tecnicos/constants";
import type {
  AtualizarFiltrosTecnicos,
  ContagemListagemTecnicos,
  EmpresaFechamento,
  FiltroListagemTecnicos,
  FiltrosUrlTecnicos,
  ListagemNaUrl,
  PeriodoFechamento,
} from "@/types/tecnicos";
import {
  deduplicarTecnicos,
  filtrarDadosBase,
  montarListaTecnicos,
  montarResumo,
  obterMensagemErro,
  resolverFiltroListagem,
} from "@/pages/Fechamentos/semanal/tecnicos/services/tecnicos.helper";
import { mesclarOrdensManuais } from "@/pages/Fechamentos/semanal/tecnicos/services/adicionarOrdemServico.helper";
import { FechamentoSemanalRules, OrdemServico, ResumoFechamentoDTO, StatusAuditoria, TecnicoRowViewModel } from "@/pages/Fechamentos/types";

export interface UseTecnicosReturn {
  dataInicio: string;
  dataFim: string;
  setDataInicio: (value: string) => void;
  setDataFim: (value: string) => void;
  setPeriodo: (periodo: PeriodoFechamento) => void;
  filtroEmpresa: EmpresaFechamento;
  setFiltroEmpresa: (value: EmpresaFechamento) => void;
  filtroTecnico: string;
  setFiltroTecnico: (value: string) => void;
  buscaOS: string;
  setBuscaOS: (value: string) => void;
  filtroListagem: FiltroListagemTecnicos;
  setFiltroListagem: (value: FiltroListagemTecnicos) => void;
  contagemListagem: ContagemListagemTecnicos;
  quantidadePorCliente: Map<string, number>;
  dadosBase: TecnicoRowViewModel[];
  dadosFiltrados: TecnicoRowViewModel[];
  dadosBrutos: OrdemServico[];
  listaTecnicos: TecnicoFechamento[];
  resumo: ResumoFechamentoDTO;
  loading: boolean;
  erro: string | null;
  handleExcluir: (id: string) => void;
  handleAlterarStatus: (id: string, novoStatus: StatusAuditoria) => void;
  handleAdicionarOs: (ordem: OrdemServico) => void;
}

export const useTecnicos = (): UseTecnicosReturn => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [periodoPadrao] = useState(() => getPeriodoFechamentoSemanal());

  const [dadosBrutos, setDadosBrutos] = useState<OrdemServico[]>([]);
  const [tecnicosCadastro, setTecnicosCadastro] = useState<TecnicoFechamento[]>(
    [],
  );
  const [semanalRules, setSemanalRules] = useState<FechamentoSemanalRules | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const dataInicioParam = searchParams.get(QUERY_TECNICOS.dataInicio);
  const dataFimParam = searchParams.get(QUERY_TECNICOS.dataFim);
  const dataInicio: string = isDataIso(dataInicioParam)
    ? dataInicioParam
    : periodoPadrao.dataInicio;
  const dataFim: string = isDataIso(dataFimParam)
    ? dataFimParam
    : periodoPadrao.dataFim;
  const filtroEmpresa: EmpresaFechamento = lerEmpresaDaQuery(
    searchParams.get(QUERY_TECNICOS.empresa),
  );

  const buscaOS: string = searchParams.get(QUERY_TECNICOS.busca) ?? "";
  const listagemNaUrl: ListagemNaUrl = lerListagemDaQuery(
    searchParams.get(QUERY_TECNICOS.listagem),
  );
  const idsTecnicos: string[] = tecnicosCadastro.map((tecnico) => tecnico.id);
  const filtroTecnico: string = lerTecnicoDaQuery(
    searchParams.get(QUERY_TECNICOS.tecnico),
    idsTecnicos,
  );

  const persistirNaUrl = (filtros: FiltrosUrlTecnicos): void => {
    const search = aplicarFiltroNaQuery(new URLSearchParams(), filtros).toString();
    navigate(
      {
        pathname: location.pathname,
        search: search.length > 0 ? `?${search}` : "",
      },
      { replace: true },
    );
  };

  const atualizarQuery = (filtros: AtualizarFiltrosTecnicos): void => {
    persistirNaUrl({
      dataInicio: filtros.dataInicio ?? dataInicio,
      dataFim: filtros.dataFim ?? dataFim,
      empresa: filtros.empresa ?? filtroEmpresa,
      tecnico: filtros.tecnico ?? filtroTecnico,
      busca: filtros.busca ?? buscaOS,
      listagem: filtros.listagem ?? listagemNaUrl,
    });
  };

  const carregarRegras = (): (() => void) => {
    let ativo = true;

    ConfigService.getInstance()
      .loadConfigurations()
      .then((config) => {
        if (ativo) {
          setSemanalRules(config.fechamento_semanal);
        }
      })
      .catch(() => {
        if (ativo) {
          setSemanalRules(null);
        }
      });

    return () => {
      ativo = false;
    };
  };

  const carregarInstalacoes = (): (() => void) => {
    let ativo = true;

    const consultarRelatorio = async (): Promise<void> => {
      setLoading(true);
      setErro(null);

      try {
        const response: RelatorioTecnicoResponse =
          await ReportsService.buscarInstalacaoTecnica({
            dataInicio,
            dataFim,
            empresa: filtroEmpresa,
          });

        if (!ativo) {
          return;
        }

        setDadosBrutos((atuais) => mesclarOrdensManuais(atuais, response.data));
        setTecnicosCadastro(deduplicarTecnicos(response.tecnicos));
      } catch (error: unknown) {
        if (!ativo) {
          return;
        }

        setErro(obterMensagemErro(error));
        setDadosBrutos([]);
        setTecnicosCadastro([]);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    const agendar = window.setTimeout(() => {
      void consultarRelatorio();
    }, DEBOUNCE_CONSULTA_MS);

    return () => {
      ativo = false;
      window.clearTimeout(agendar);
    };
  };

  useEffect(() => {
    return carregarRegras();
  }, []);

  useEffect(() => {
    return carregarInstalacoes();
  }, [dataInicio, dataFim, filtroEmpresa]);

  const dadosDeduplicados: TecnicoRowViewModel[] = semanalRules
    ? processarEDeduplicar(dadosBrutos, semanalRules)
    : [];

  const listaTecnicos: TecnicoFechamento[] =
    montarListaTecnicos(tecnicosCadastro);

  const dadosBase: TecnicoRowViewModel[] = filtrarDadosBase({
    dados: dadosDeduplicados,
    listaTecnicos,
    filtroTecnico,
    filtroEmpresa,
    buscaOS,
  });

  const quantidadePorCliente: Map<string, number> =
    contarQuantidadePorCliente(dadosBase);

  const contagemListagem: ContagemListagemTecnicos =
    contarListagem(dadosBase, quantidadePorCliente);

  const filtroListagem: FiltroListagemTecnicos = resolverFiltroListagem(
    listagemNaUrl,
    contagemListagem,
  );

  const dadosFiltrados: TecnicoRowViewModel[] = filtrarListagem(
    dadosBase,
    filtroListagem,
    quantidadePorCliente,
  );

  const resumo: ResumoFechamentoDTO = montarResumo({
    dadosBase,
    listaTecnicos,
    filtroTecnico,
    dataInicio,
    dataFim,
  });

  const handleAdicionarOs = (ordem: OrdemServico): void => {
    setDadosBrutos((prev) => [ordem, ...prev]);
    atualizarQuery({ listagem: "TODOS" });
  };

  const handleExcluir = (id: string): void => {
    setDadosBrutos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAlterarStatus = (id: string, novoStatus: StatusAuditoria): void => {
    setDadosBrutos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status_auditoria: novoStatus } : item,
      ),
    );
  };

  const setDataInicio = (value: string): void => {
    atualizarQuery({ dataInicio: value });
  };

  const setDataFim = (value: string): void => {
    atualizarQuery({ dataFim: value });
  };

  const setPeriodo = (periodo: PeriodoFechamento): void => {
    atualizarQuery(periodo);
  };

  const setFiltroEmpresa = (value: EmpresaFechamento): void => {
    atualizarQuery({ empresa: value });
  };

  const setFiltroTecnico = (value: string): void => {
    atualizarQuery({ tecnico: value });
  };

  const setBuscaOS = (value: string): void => {
    atualizarQuery({ busca: value });
  };

  const setFiltroListagem = (value: FiltroListagemTecnicos): void => {
    atualizarQuery({ listagem: value });
  };

  return {
    dataInicio,
    dataFim,
    setDataInicio,
    setDataFim,
    setPeriodo,
    filtroEmpresa,
    setFiltroEmpresa,
    filtroTecnico,
    setFiltroTecnico,
    buscaOS,
    setBuscaOS,
    filtroListagem,
    setFiltroListagem,
    contagemListagem,
    quantidadePorCliente,
    dadosBase,
    dadosFiltrados,
    dadosBrutos,
    listaTecnicos,
    resumo,
    loading,
    erro,
    handleExcluir,
    handleAlterarStatus,
    handleAdicionarOs,
  };
};

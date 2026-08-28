import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { ConfigService } from "@/config/ConfigService";
import { ReportsService, TecnicoFechamento } from "@/service/reportsService";
import { TecnicoService } from "../services/tecnicoService";
import {
  aplicarFiltroNaQuery,
  isDataIso,
  lerEmpresaDaQuery,
  lerTecnicoDaQuery,
  QUERY_TECNICOS,
} from "../services/queryTecnicos";
import {
  FechamentoSemanalRules,
  OrdemServico,
  ResumoFechamentoDTO,
  StatusAuditoria,
} from "../../../types";

function formatarDataIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function getQuintaMaisRecente(referencia = new Date()): Date {
  const data = new Date(referencia);
  data.setHours(0, 0, 0, 0);
  const diaSemana = data.getDay();
  const diasDesdeQuinta = (diaSemana - 4 + 7) % 7;
  data.setDate(data.getDate() - diasDesdeQuinta);
  return data;
}

function somarDias(dataIso: string, dias: number): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia + dias);
  return formatarDataIso(data);
}

function formatarDataBr(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function getPeriodoFechamentoSemanal(referencia = new Date()): {
  dataInicio: string;
  dataFim: string;
  dataPagamento: string;
} {
  const quintaPagamento = getQuintaMaisRecente(referencia);
  const dataPagamento = formatarDataIso(quintaPagamento);
  return {
    dataInicio: somarDias(dataPagamento, -7),
    dataFim: somarDias(dataPagamento, -1),
    dataPagamento,
  };
}

function textoBuscaOrdem(os: OrdemServico): string {
  return [
    os.numero_ordem_servico,
    os.codigo_cliente,
    os.nome_cliente,
    os.usuario_fechamento_limpo,
    os.usuario_fechamento,
    os.conta,
    os.cidade,
    os.estado,
    os.tipo_ordem_servico,
  ]
    .join(" ")
    .toLowerCase();
}

function ordemCorrespondeABusca(os: OrdemServico, busca: string): boolean {
  const termos = busca
    .trim()
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter((termo) => termo.length > 0 && termo !== "e");

  if (termos.length === 0) {
    return true;
  }

  const texto = textoBuscaOrdem(os);
  return termos.every((termo) => texto.includes(termo));
}

export const useTecnicos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const periodoPadrao = useMemo(() => getPeriodoFechamentoSemanal(), []);
  const [dadosBrutos, setDadosBrutos] = useState<OrdemServico[]>([]);
  const [tecnicosCadastro, setTecnicosCadastro] = useState<TecnicoFechamento[]>(
    [],
  );
  const [semanalRules, setSemanalRules] = useState<FechamentoSemanalRules | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const dataInicio = isDataIso(searchParams.get(QUERY_TECNICOS.dataInicio))
    ? searchParams.get(QUERY_TECNICOS.dataInicio)!
    : periodoPadrao.dataInicio;
  const dataFim = isDataIso(searchParams.get(QUERY_TECNICOS.dataFim))
    ? searchParams.get(QUERY_TECNICOS.dataFim)!
    : periodoPadrao.dataFim;
  const filtroEmpresa = lerEmpresaDaQuery(
    searchParams.get(QUERY_TECNICOS.empresa),
  );
  const buscaOS = searchParams.get(QUERY_TECNICOS.busca) ?? "";
  const filtroTecnico = lerTecnicoDaQuery(
    searchParams.get(QUERY_TECNICOS.tecnico),
    tecnicosCadastro.map((tecnico) => tecnico.id),
  );

  const atualizarQuery = (filtros: {
    dataInicio?: string;
    dataFim?: string;
    empresa?: string;
    tecnico?: string;
    busca?: string;
  }) => {
    setSearchParams(
      aplicarFiltroNaQuery(searchParams, {
        dataInicio: filtros.dataInicio ?? dataInicio,
        dataFim: filtros.dataFim ?? dataFim,
        empresa: filtros.empresa ?? filtroEmpresa,
        tecnico: filtros.tecnico ?? filtroTecnico,
        busca: filtros.busca ?? buscaOS,
      }),
      { replace: true },
    );
  };

  useEffect(() => {
    const jaTemPeriodo =
      isDataIso(searchParams.get(QUERY_TECNICOS.dataInicio)) &&
      isDataIso(searchParams.get(QUERY_TECNICOS.dataFim));

    if (jaTemPeriodo) {
      return;
    }

    atualizarQuery({
      dataInicio,
      dataFim,
    });
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarFechamento() {
      setLoading(true);
      setErro(null);

      try {
        const config = await ConfigService.getInstance().loadConfigurations();
        const response = await ReportsService.buscarInstalacaoTecnica({
          dataInicio,
          dataFim,
        });

        if (!ativo) {
          return;
        }

        const tecnicosUnicos = Array.from(
          new Map(
            (response.tecnicos ?? []).map((tecnico) => [tecnico.id, tecnico]),
          ).values(),
        );

        setSemanalRules(config.fechamento_semanal);
        setDadosBrutos(response.data);
        setTecnicosCadastro(tecnicosUnicos);
      } catch (error) {
        if (!ativo) {
          return;
        }

        const mensagem = isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        const mensagemTexto = Array.isArray(mensagem)
          ? mensagem.join(" ")
          : mensagem;
        setErro(
          typeof mensagemTexto === "string" && mensagemTexto.length > 0
            ? mensagemTexto
            : "Não foi possível carregar as instalações do Metabase.",
        );
        setDadosBrutos([]);
        setTecnicosCadastro([]);
        setSemanalRules(null);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarFechamento();

    return () => {
      ativo = false;
    };
  }, [dataInicio, dataFim]);

  const dadosDeduplicados = useMemo(() => {
    if (!semanalRules) {
      return [];
    }

    return TecnicoService.processarEDeduplicar(dadosBrutos, semanalRules);
  }, [dadosBrutos, semanalRules]);

  const listaTecnicos = useMemo(() => {
    return [{ id: "TODOS", name: "Todos os técnicos" }, ...tecnicosCadastro];
  }, [tecnicosCadastro]);

  const dadosFiltrados = useMemo(() => {
    const tecnicoSelecionado = listaTecnicos.find(
      (tecnico) => tecnico.id === filtroTecnico,
    );
    const nomeTecnico = tecnicoSelecionado?.name ?? "";
    const filtrandoLiderLobatos =
      filtroTecnico !== "TODOS" &&
      /leidinaldo|lobatos|lobato/i.test(
        nomeTecnico.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      );

    return dadosDeduplicados.filter((os) => {
      const matchEmpresa =
        filtroEmpresa === "TODAS" || os.conta === filtroEmpresa;
      const matchTecnico =
        filtroTecnico === "TODOS" ||
        os.tecnico_id === filtroTecnico ||
        (filtrandoLiderLobatos &&
          os.usuario_fechamento.toUpperCase().includes("TEC_LOBATOS"));
      return (
        matchEmpresa && matchTecnico && ordemCorrespondeABusca(os, buscaOS)
      );
    });
  }, [dadosDeduplicados, filtroTecnico, buscaOS, filtroEmpresa, listaTecnicos]);

  const resumo = useMemo<ResumoFechamentoDTO>(() => {
    const totais = dadosFiltrados.reduce(
      (acc, os) => {
        acc.totalOS += 1;
        if (os.status_financeiro === "PAGO") {
          acc.aprovadas += 1;
          acc.totalReceber += os.valor_a_pagar || 0;
        } else {
          acc.reprovadas += 1;
        }
        return acc;
      },
      { totalReceber: 0, totalOS: 0, aprovadas: 0, reprovadas: 0 },
    );

    const tecnicoSelecionado = listaTecnicos.find(
      (tecnico) => tecnico.id === filtroTecnico,
    );

    return {
      ...totais,
      dataPagamento: somarDias(dataFim, 1),
      tecnico:
        filtroTecnico === "TODOS"
          ? "Todos os técnicos"
          : tecnicoSelecionado?.name ?? "Técnico",
      periodo: `${formatarDataBr(dataInicio)} a ${formatarDataBr(dataFim)}`,
    };
  }, [dadosFiltrados, dataInicio, dataFim, filtroTecnico, listaTecnicos]);

  const handleExcluir = (id: string) => {
    setDadosBrutos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAlterarStatus = (id: string, novoStatus: StatusAuditoria) => {
    const registroOriginal = dadosBrutos.find((item) => item.id === id);
    if (!registroOriginal) return;

    const statusBloqueados: StatusAuditoria[] = ["APROVADO", "NC APROVADO"];
    if (statusBloqueados.includes(registroOriginal.status_auditoria)) {
      alert(
        `Bloqueio de Segurança: O registro ${registroOriginal.numero_ordem_servico} já possui liquidação financeira pendente/aprovada. Use a Auditoria com validação de Líder.`,
      );
      return;
    }

    setDadosBrutos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status_auditoria: novoStatus } : item,
      ),
    );
  };

  return {
    dataInicio,
    dataFim,
    setDataInicio: (value: string) => atualizarQuery({ dataInicio: value }),
    setDataFim: (value: string) => atualizarQuery({ dataFim: value }),
    filtroEmpresa,
    setFiltroEmpresa: (value: string) => atualizarQuery({ empresa: value }),
    filtroTecnico,
    setFiltroTecnico: (value: string) => atualizarQuery({ tecnico: value }),
    buscaOS,
    setBuscaOS: (value: string) => atualizarQuery({ busca: value }),
    dadosFiltrados,
    listaTecnicos,
    resumo,
    loading,
    erro,
    handleExcluir,
    handleAlterarStatus,
  };
};

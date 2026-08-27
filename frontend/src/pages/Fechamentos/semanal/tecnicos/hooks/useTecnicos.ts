import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { ConfigService } from "../../../../../config/ConfigService";
import { ReportsService, TecnicoFechamento } from "@/service/reportsService";
import { TecnicoService } from "../services/tecnicoService";
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

export const useTecnicos = (filtroTecnico: string, buscaOS: string) => {
  const [dataInicio, setDataInicio] = useState(
    formatarDataIso(getQuintaMaisRecente()),
  );
  const [dataFim, setDataFim] = useState(() =>
    somarDias(formatarDataIso(getQuintaMaisRecente()), 6),
  );
  const [dadosBrutos, setDadosBrutos] = useState<OrdemServico[]>([]);
  const [tecnicosCadastro, setTecnicosCadastro] = useState<TecnicoFechamento[]>(
    [],
  );
  const [semanalRules, setSemanalRules] = useState<FechamentoSemanalRules | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

        setSemanalRules(config.fechamento_semanal);
        setDadosBrutos(response.data);
        setTecnicosCadastro(response.tecnicos ?? []);
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
    if (!semanalRules) return [];
    return TecnicoService.processarEDeduplicar(dadosBrutos, semanalRules);
  }, [dadosBrutos, semanalRules]);

  const listaTecnicos = useMemo(() => {
    return [
      { id: "TODOS", name: "Todos os técnicos" },
      ...tecnicosCadastro,
    ];
  }, [tecnicosCadastro]);

  const dadosFiltrados = useMemo(() => {
    return dadosDeduplicados.filter((os) => {
      const matchTecnico =
        filtroTecnico === "TODOS" || os.tecnico_id === filtroTecnico;
      const termo = buscaOS.trim().toLowerCase();
      const matchBusca =
        termo.length === 0 ||
        os.numero_ordem_servico.toLowerCase().includes(termo) ||
        os.codigo_cliente.toLowerCase().includes(termo) ||
        (os.nome_cliente || "").toLowerCase().includes(termo) ||
        os.usuario_fechamento_limpo.toLowerCase().includes(termo);
      return matchTecnico && matchBusca;
    });
  }, [dadosDeduplicados, filtroTecnico, buscaOS]);

  const resumo = useMemo<ResumoFechamentoDTO>(() => {
    return dadosFiltrados.reduce(
      (acc, os) => {
        acc.totalOS += 1;
        if (os.status_financeiro === "PAGO") {
          acc.aprovadas += 1;
          acc.totalReceber += os.valor_a_pagar || 0;
        } else {
          acc.pendentes += 1;
        }
        return acc;
      },
      { totalReceber: 0, totalOS: 0, aprovadas: 0, pendentes: 0 },
    );
  }, [dadosFiltrados]);

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
    setDataInicio,
    setDataFim,
    dadosFiltrados,
    listaTecnicos,
    resumo,
    loading,
    erro,
    handleExcluir,
    handleAlterarStatus,
  };
};

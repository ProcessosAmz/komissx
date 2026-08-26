import { Host } from "@/common/enums/host.enum";
import {
  OrdemServicoStatus,
  OrdemServicoTipoId,
} from "@/common/enums/OrdemServicoStatus.enum";

export type CategoriaOrdemServicoFilaQualidade =
  | typeof OrdemServicoStatus.INSTALACAO
  | typeof OrdemServicoStatus.MUDANCA_ENDERECO
  | typeof OrdemServicoStatus.NAO_CONFORMIDADE;

const STATUS_OS_FINALIZADO = "finalizado";
const STATUS_FECHAMENTO_OS_CONCLUIDO = "concluido";
const MOTIVO_INSTALACAO_CONCLUIDA = "instalacao concluida com sucesso";

export const formatarDataYmdFilaQualidade = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const obterQuintaMaisRecenteFilaQualidade = (
  referenceDate = new Date(),
): Date => {
  const result = new Date(referenceDate);
  result.setHours(0, 0, 0, 0);
  const dayOfWeek = result.getDay();
  const daysSinceThursday = (dayOfWeek - 4 + 7) % 7;
  result.setDate(result.getDate() - daysSinceThursday);

  return result;
};

export const resolverCategoriaOrdemServicoFilaQualidade = (
  host: Host,
  idTipo: number,
): CategoriaOrdemServicoFilaQualidade | null => {
  const tipos = OrdemServicoTipoId[host];

  if ((tipos.INSTALACAO as readonly number[]).includes(idTipo)) {
    return OrdemServicoStatus.INSTALACAO;
  }

  if ((tipos.MUDANCA_ENDERECO as readonly number[]).includes(idTipo)) {
    return OrdemServicoStatus.MUDANCA_ENDERECO;
  }

  if ((tipos.NAO_CONFORMIDADE as readonly number[]).includes(idTipo)) {
    return OrdemServicoStatus.NAO_CONFORMIDADE;
  }

  return null;
};

export const isOrdemDeInstalacaoFilaQualidade = (
  host: Host,
  idTipo: number,
): boolean =>
  resolverCategoriaOrdemServicoFilaQualidade(host, idTipo) ===
  OrdemServicoStatus.INSTALACAO;

const normalizarStatusFilaQualidade = (valor: string): string =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type OrdemComStatusFechamentoFilaQualidade = {
  status?: string;
  status_fechamento?: string | null;
  motivo_fechamento?: { descricao?: string }[] | null;
};

const isOsFinalizadaFilaQualidade = (
  ordem: OrdemComStatusFechamentoFilaQualidade,
): boolean =>
  normalizarStatusFilaQualidade(ordem.status ?? "") === STATUS_OS_FINALIZADO;

const isOsInstalacaoConcluidaFilaQualidade = (
  ordem: OrdemComStatusFechamentoFilaQualidade,
): boolean => {
  if (!isOsFinalizadaFilaQualidade(ordem)) {
    return false;
  }

  if (
    normalizarStatusFilaQualidade(ordem.status_fechamento ?? "") ===
    STATUS_FECHAMENTO_OS_CONCLUIDO
  ) {
    return true;
  }

  return (ordem.motivo_fechamento ?? []).some(
    (motivo) =>
      normalizarStatusFilaQualidade(motivo.descricao ?? "") ===
      MOTIVO_INSTALACAO_CONCLUIDA,
  );
};

export const isOsElegivelParaFilaQualidade = (
  ordem: OrdemComStatusFechamentoFilaQualidade,
  categoria: CategoriaOrdemServicoFilaQualidade | null,
): boolean => {
  if (!categoria) {
    return false;
  }

  if (categoria === OrdemServicoStatus.INSTALACAO) {
    return isOsInstalacaoConcluidaFilaQualidade(ordem);
  }

  return isOsFinalizadaFilaQualidade(ordem);
};

import { OrdemServicoStatus } from "src/common/enums/OrdemServicoStatus.enum";
import { CategoriaOrdemServico } from "src/integrations/service/helper/ordemServicoTipo.helper";

const STATUS_OS_FINALIZADO = "finalizado";
const STATUS_FECHAMENTO_OS_CONCLUIDO = "concluido";
const MOTIVO_INSTALACAO_CONCLUIDA = "instalacao concluida com sucesso";

const normalizarStatus = (valor: string): string =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export type OrdemComStatusFechamento = {
  status?: string;
  status_fechamento?: string | null;
  motivo_fechamento?: { descricao?: string }[] | null;
};

export const isOsFinalizada = (ordem: OrdemComStatusFechamento): boolean =>
  normalizarStatus(ordem.status ?? "") === STATUS_OS_FINALIZADO;

export const isOsInstalacaoConcluida = (
  ordem: OrdemComStatusFechamento,
): boolean => {
  if (!isOsFinalizada(ordem)) {
    return false;
  }

  if (
    normalizarStatus(ordem.status_fechamento ?? "") ===
    STATUS_FECHAMENTO_OS_CONCLUIDO
  ) {
    return true;
  }

  return (ordem.motivo_fechamento ?? []).some(
    (motivo) =>
      normalizarStatus(motivo.descricao ?? "") === MOTIVO_INSTALACAO_CONCLUIDA,
  );
};

export const isOsElegivelParaFila = (
  ordem: OrdemComStatusFechamento,
  categoria: CategoriaOrdemServico | null,
): boolean => {
  if (!categoria) {
    return false;
  }

  if (categoria === OrdemServicoStatus.INSTALACAO) {
    return isOsInstalacaoConcluida(ordem);
  }

  return isOsFinalizada(ordem);
};
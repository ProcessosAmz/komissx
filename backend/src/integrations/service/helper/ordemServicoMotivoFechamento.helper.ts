const STATUS_OS_FINALIZADO = 'finalizado';
const STATUS_FECHAMENTO_OS_CONCLUIDO = 'concluido';
const MOTIVO_INSTALACAO_CONCLUIDA = 'instalacao concluida com sucesso';

export type OrdemComStatusFechamento = {
  status?: string;
  status_fechamento?: string | null;
  motivo_fechamento?: { descricao?: string }[] | null;
};

const normalizarStatus = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const isOsInstalacaoConcluida = (
  ordem: OrdemComStatusFechamento,
): boolean => {
  if (normalizarStatus(ordem.status ?? '') !== STATUS_OS_FINALIZADO) {
    return false;
  }

  if (
    normalizarStatus(ordem.status_fechamento ?? '') ===
    STATUS_FECHAMENTO_OS_CONCLUIDO
  ) {
    return true;
  }

  return (ordem.motivo_fechamento ?? []).some(
    (motivo) =>
      normalizarStatus(motivo.descricao ?? '') === MOTIVO_INSTALACAO_CONCLUIDA,
  );
};

export const isOsInstalacaoDesistencia = (
  ordem: OrdemComStatusFechamento,
): boolean => {
  if (normalizarStatus(ordem.status ?? '') !== STATUS_OS_FINALIZADO) {
    return false;
  }

  const statusFechamento = normalizarStatus(ordem.status_fechamento ?? '');

  if (statusFechamento.includes('desist')) {
    return true;
  }

  return (ordem.motivo_fechamento ?? []).some((motivo) =>
    normalizarStatus(motivo.descricao ?? '').includes('desist'),
  );
};
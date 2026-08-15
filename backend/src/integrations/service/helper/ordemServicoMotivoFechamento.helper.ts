const ID_MOTIVO_INSTALACAO_CONCLUIDA_COM_SUCESSO = 297;

export type MotivoFechamentoOs = {
  id_motivo_fechamento: number | string;
  descricao: string;
};

export type OrdemComMotivoFechamento = {
  motivo_fechamento?: MotivoFechamentoOs[] | null;
};

export const isOsInstalacaoConcluida = (
  ordem: OrdemComMotivoFechamento,
): boolean =>
  (ordem.motivo_fechamento ?? []).some(
    (motivo) =>
      Number(motivo.id_motivo_fechamento) ===
      ID_MOTIVO_INSTALACAO_CONCLUIDA_COM_SUCESSO,
  );
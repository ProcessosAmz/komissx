import { Logger } from '@nestjs/common';
import { Host } from '@/common/enums/host.enum';
import { fechamentoDesistenciaPorHost } from '@/integrations/constants/hubsoft/atendimentoPadrao.constants';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import { HubsoftUpdateAtendimentoRepository } from '@/integrations/repository/hubsoft';
import { OrdemServicoListaItem } from '@/integrations/types/OrderServicoLista.type';
import { getErrorMessage } from '@/utils/error.utils';

const isAtendimentoJaFinalizado = (message: string): boolean =>
  message.toLowerCase().includes('já finalizado');

export const fecharAuditoriasPorDesistencia = async (params: {
  host: Host;
  token: string;
  resultado: OrdemServicoListaItem[];
  hubsoftUpdateAtendimentoRepository: HubsoftUpdateAtendimentoRepository;
  hubsoftLogger: HubsoftLogger;
  logger: Logger;
}): Promise<OrdemServicoListaItem[]> => {
  const fechamento = fechamentoDesistenciaPorHost[params.host];
  const idsAtendimento = [
    ...new Set(params.resultado.map((ordem) => ordem.idAtendimento)),
  ];

  if (
    !fechamento ||
    !fechamento.idAtendimentoStatus ||
    !fechamento.idMotivoFechamento
  ) {
    params.logger.warn(
      `Desistência — PUT ignorado: cadastre idAtendimentoStatus e idMotivoFechamento (${params.host})`,
    );
    return params.resultado;
  }

  const idsAtualizados = new Set<number>();
  const bodyPut = {
    fechar_atendimento: true,
    id_tipo_atendimento: fechamento.idTipoAtendimento,
    id_atendimento_status: fechamento.idAtendimentoStatus,
    id_motivo_fechamento_atendimento: fechamento.idMotivoFechamento,
    descricao_fechamento: fechamento.descricaoFechamento,
  };

  for (const idAtendimento of idsAtendimento) {
    const ordemAtualizada = params.resultado.find(
      (ordem) => ordem.idAtendimento === idAtendimento,
    );

    try {
      await params.hubsoftUpdateAtendimentoRepository.execute(
        params.host,
        idAtendimento,
        bodyPut,
        params.token,
      );
      idsAtualizados.add(idAtendimento);
      params.logger.log(
        `Desistência — fechado | cliente ${ordemAtualizada?.codigoCliente} | atendimento ${idAtendimento} | protocolo ${ordemAtualizada?.protocolo} | OS ${ordemAtualizada?.numeroOrdemServico} (${params.host})`,
      );
      await params.hubsoftLogger.filaQualidade({
        action: 'desistencia_fechado',
        message: `Atendimento ${idAtendimento} fechado na etapa (COMERCIAL) DESISTÊNCIA`,
        host: params.host,
        entityId: idAtendimento,
        data: {
          host: params.host,
          idAtendimento,
          codigoCliente: ordemAtualizada?.codigoCliente,
          idTipoAtendimento: fechamento.idTipoAtendimento,
          motivo: fechamento.descricaoFechamento,
        },
      });
    } catch (error) {
      const message = getErrorMessage(error);

      if (isAtendimentoJaFinalizado(message)) {
        params.logger.log(
          `Desistência — ignorado | atendimento ${idAtendimento} | OS ${ordemAtualizada?.numeroOrdemServico} (${params.host}) — atendimento já finalizado`,
        );
        continue;
      }

      params.logger.error(
        `Desistência — erro | atendimento ${idAtendimento} | OS ${ordemAtualizada?.numeroOrdemServico} (${params.host}) — ${message}`,
      );
      await params.hubsoftLogger.filaQualidade({
        action: 'desistencia_erro',
        message: `PUT desistência ERRO idAtendimento=${idAtendimento} message=${message}`,
        host: params.host,
        entityId: idAtendimento,
        data: {
          host: params.host,
          idAtendimento,
          codigoCliente: ordemAtualizada?.codigoCliente,
          motivo: message,
        },
      });
    }
  }

  params.logger.log(
    `Desistência — ${params.resultado.length} encontrados, ${idsAtualizados.size} fechados (${params.host})`,
  );

  return params.resultado.sort((esquerda, direita) =>
    direita.dataCadastro.localeCompare(esquerda.dataCadastro),
  );
};
import { Host } from "@/common/enums/host.enum";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
import { hubsoftConsole } from "@/integrations/logger/hubsoftConsole.logger";
import {
  HubsoftEditarAtendimentoBody,
  HubsoftUpdateAtendimentoRepository,
} from "@/integrations/repository/hubsoft";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { isAtendimentoFinalizado } from "@/integrations/useCase/helper/filaQualidade.helper";
import { getErrorMessage } from "@/utils/error.utils";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateAuditTicketUseCase {
  constructor(
    private readonly hubsoftUpdateAtendimentoRepository: HubsoftUpdateAtendimentoRepository,
    private readonly hubsoftLogger: HubsoftLogger,
  ) {}

  async execute({
    host,
    token,
    ordem,
    body,
    nomeFila,
  }: {
    host: Host;
    token: string;
    ordem: OrdemServicoListaItem;
    body: HubsoftEditarAtendimentoBody;
    nomeFila: string;
  }): Promise<boolean> {
    if (!ordem.idAtendimento) {
      hubsoftConsole.warn(
        host,
        "update",
        `PUT ignorado | OS ${ordem.numeroOrdemServico} | cliente ${ordem.codigoCliente} — sem atendimento`,
      );
      return false;
    }

    try {
      await this.hubsoftUpdateAtendimentoRepository.execute(
        host,
        ordem.idAtendimento,
        body,
        token,
      );

      await this.hubsoftLogger.filaQualidade({
        action: "qualidade_atualizado",
        message: `Atendimento ${ordem.idAtendimento} atualizado | categoria ${ordem.categoriaOrdemServico}`,
        host,
        entityId: ordem.idAtendimento,
        data: {
          host,
          idAtendimento: ordem.idAtendimento,
          codigoCliente: ordem.codigoCliente,
          idFila: body.id_usuario_responsavel ?? ordem.idFila ?? undefined,
          nomeFila,
          idUsuarioResponsavel:
            body.id_usuario_responsavel ?? ordem.idUsuarioResponsavel,
        },
      });

      return true;
    } catch (error) {
      const message = getErrorMessage(error);

      if (isAtendimentoFinalizado(message)) {
        hubsoftConsole.skip(
          host,
          "update",
          `já finalizado | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente}`,
        );
        return false;
      }

      hubsoftConsole.error(
        host,
        "update",
        `PUT erro | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente} — ${message}`,
      );

      await this.hubsoftLogger.filaQualidade({
        action: "qualidade_erro",
        message: `PUT qualidade ERRO idAtendimento=${ordem.idAtendimento} message=${message}`,
        host,
        entityId: ordem.idAtendimento,
        data: {
          host,
          idAtendimento: ordem.idAtendimento,
          codigoCliente: ordem.codigoCliente,
          motivo: message,
        },
      });

      return false;
    }
  }
}

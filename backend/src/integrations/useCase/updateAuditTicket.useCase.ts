import { Host } from "@/common/enums/host.enum";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
import {
  HubsoftEditarAtendimentoBody,
  HubsoftUpdateAtendimentoRepository,
} from "@/integrations/repository/hubsoft";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { isAtendimentoFinalizado } from "@/integrations/useCase/helper";
import { getErrorMessage } from "@/utils/error.utils";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UpdateAuditTicketUseCase {
  private readonly logger = new Logger(UpdateAuditTicketUseCase.name);

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
    try {
      await this.hubsoftUpdateAtendimentoRepository.execute(
        host,
        ordem.idAtendimento,
        body,
        token,
      );

      this.logger.log(
        `Fila qualidade — PUT ok | categoria ${ordem.categoriaOrdemServico} | cliente ${ordem.codigoCliente} | atendimento ${ordem.idAtendimento} | protocolo ${ordem.protocolo} | OS ${ordem.numeroOrdemServico} (${host})`,
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
          idFila: body.id_usuario_responsavel ?? ordem.idFila,
          nomeFila,
          idUsuarioResponsavel:
            body.id_usuario_responsavel ?? ordem.idUsuarioResponsavel,
        },
      });

      return true;
    } catch (error) {
      const message = getErrorMessage(error);

      if (isAtendimentoFinalizado(message)) {
        this.logger.log(
          `Fila qualidade — ignorado | cliente ${ordem.codigoCliente} | atendimento ${ordem.idAtendimento} | OS ${ordem.numeroOrdemServico} (${host}) — atendimento já finalizado`,
        );
        return false;
      }

      this.logger.error(
        `Fila qualidade — PUT erro | cliente ${ordem.codigoCliente} | atendimento ${ordem.idAtendimento} | OS ${ordem.numeroOrdemServico} (${host}) — ${message}`,
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
import { Host } from "@/common/enums/host.enum";
import {
  idStatusAguardandoAnalisePorHost,
  idUsuarioFilaQualidadePorHost,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { UpdateAuditTicketUseCase } from "@/integrations/useCase/updateAuditTicket.useCase";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MoveAddressChangeToQualityQueueUseCase {
  private readonly logger = new Logger(
    MoveAddressChangeToQualityQueueUseCase.name,
  );

  constructor(
    private readonly updateAuditTicketUseCase: UpdateAuditTicketUseCase,
  ) {}

  async execute({
    host,
    token,
    ordem,
  }: {
    host: Host;
    token: string;
    ordem: OrdemServicoListaItem;
  }): Promise<boolean> {
    const idFilaQualidade = idUsuarioFilaQualidadePorHost[host];
    const idStatus = idStatusAguardandoAnalisePorHost[host];

    this.logger.log(
      `Fila qualidade — mudança de endereço | OS ${ordem.numeroOrdemServico} | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente} | status ${idStatus} | fila ${idFilaQualidade ?? "n/a"} (${host})`,
    );

    if (!idFilaQualidade) {
      this.logger.warn(
        `Fila qualidade — mudança de endereço ignorada | fila qualidade não configurada (${host})`,
      );
      return false;
    }

    return this.updateAuditTicketUseCase.execute({
      host,
      token,
      ordem,
      nomeFila: "FILA QUALIDADE AUDITORIA",
      body: {
        fechar_atendimento: false,
        id_usuario_responsavel: idFilaQualidade,
        id_atendimento_status: idStatus,
      },
    });
  }
}
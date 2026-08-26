import { Host } from "@/common/enums/host.enum";
import { idUsuarioFilaQualidadePorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { hubsoftConsole } from "@/integrations/logger/hubsoftConsole.logger";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { UpdateAuditTicketUseCase } from "@/integrations/useCase/updateAuditTicket.useCase";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MoveInstallationToQualityQueueUseCase {
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

    if (!idFilaQualidade) {
      hubsoftConsole.warn(
        host,
        "update",
        `fila qualidade não configurada — OS ${ordem.numeroOrdemServico}`,
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
      },
    });
  }
}

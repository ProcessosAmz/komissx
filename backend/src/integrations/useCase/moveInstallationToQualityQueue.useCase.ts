import { Host } from "@/common/enums/host.enum";
import { idUsuarioFilaQualidadePorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { UpdateAuditTicketUseCase } from "@/integrations/useCase/updateAuditTicket.useCase";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MoveInstallationToQualityQueueUseCase {
  private readonly logger = new Logger(
    MoveInstallationToQualityQueueUseCase.name,
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

    this.logger.log(
      `Fila qualidade — instalação | OS ${ordem.numeroOrdemServico} | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente} | fila ${idFilaQualidade ?? "n/a"} (${host})`,
    );

    if (!idFilaQualidade) {
      this.logger.warn(
        `Fila qualidade — instalação ignorada | fila qualidade não configurada (${host})`,
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
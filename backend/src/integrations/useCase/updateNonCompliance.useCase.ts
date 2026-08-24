import { Host } from "@/common/enums/host.enum";
import { idStatusReanalisePorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { UpdateAuditTicketUseCase } from "@/integrations/useCase/updateAuditTicket.useCase";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UpdateNonComplianceUseCase {
  private readonly logger = new Logger(UpdateNonComplianceUseCase.name);

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
    const idStatus = idStatusReanalisePorHost[host];

    this.logger.log(
      `Fila qualidade — não conformidade | OS ${ordem.numeroOrdemServico} | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente} | status reanálise ${idStatus} (${host})`,
    );

    return this.updateAuditTicketUseCase.execute({
      host,
      token,
      ordem,
      nomeFila: ordem.nomeFila,
      body: {
        fechar_atendimento: false,
        id_atendimento_status: idStatus,
      },
    });
  }
}
import { Host } from "@/common/enums/host.enum";
import { OrdemServicoStatus } from "@/common/enums/OrdemServicoStatus.enum";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { MoveAddressChangeToQualityQueueUseCase } from "@/integrations/useCase/moveAddressChangeToQualityQueue.useCase";
import { MoveInstallationToQualityQueueUseCase } from "@/integrations/useCase/moveInstallationToQualityQueue.useCase";
import { UpdateNonComplianceUseCase } from "@/integrations/useCase/updateNonCompliance.useCase";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DispatchQualityQueueUseCase {
  private readonly logger = new Logger(DispatchQualityQueueUseCase.name);

  constructor(
    private readonly moveInstallationToQualityQueueUseCase: MoveInstallationToQualityQueueUseCase,
    private readonly moveAddressChangeToQualityQueueUseCase: MoveAddressChangeToQualityQueueUseCase,
    private readonly updateNonComplianceUseCase: UpdateNonComplianceUseCase,
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
    this.logger.log(
      `Fila qualidade — dispatch | categoria ${ordem.categoriaOrdemServico} | OS ${ordem.numeroOrdemServico} | tipo ${ordem.idTipoOrdemServico} | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente} (${host})`,
    );

    switch (ordem.categoriaOrdemServico) {
      case OrdemServicoStatus.INSTALACAO:
        return this.moveInstallationToQualityQueueUseCase.execute({
          host,
          token,
          ordem,
        });
      case OrdemServicoStatus.MUDANCA_ENDERECO:
        return this.moveAddressChangeToQualityQueueUseCase.execute({
          host,
          token,
          ordem,
        });
      case OrdemServicoStatus.NAO_CONFORMIDADE:
        return this.updateNonComplianceUseCase.execute({
          host,
          token,
          ordem,
        });
      default:
        this.logger.warn(
          `Fila qualidade — categoria ignorada | OS ${ordem.numeroOrdemServico} | tipo ${ordem.idTipoOrdemServico} (${host})`,
        );
        return false;
    }
  }
}
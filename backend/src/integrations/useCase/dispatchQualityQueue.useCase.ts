import { Host } from "@/common/enums/host.enum";
import { OrdemServicoStatus } from "@/common/enums/OrdemServicoStatus.enum";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { MoveInstallationToQualityQueueUseCase } from "@/integrations/useCase/moveInstallationToQualityQueue.useCase";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DispatchQualityQueueUseCase {
  private readonly logger = new Logger(DispatchQualityQueueUseCase.name);

  constructor(
    private readonly moveInstallationToQualityQueueUseCase: MoveInstallationToQualityQueueUseCase,
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

    if (ordem.categoriaOrdemServico !== OrdemServicoStatus.INSTALACAO) {
      this.logger.warn(
        `Fila qualidade — categoria ignorada | OS ${ordem.numeroOrdemServico} | tipo ${ordem.idTipoOrdemServico} (${host})`,
      );
      return false;
    }

    return this.moveInstallationToQualityQueueUseCase.execute({
      host,
      token,
      ordem,
    });
  }
}
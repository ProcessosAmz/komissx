import { Host } from "@/common/enums/host.enum";
import { atendimentoPadraoPorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
import {
  HubsoftGetAtendimentoByIdRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftGetOrdensServicoRepository,
  HubsoftUpdateAtendimentoRepository,
} from "@/integrations/repository/hubsoft";
import {
  formatDateYmd,
  getMostRecentThursday,
} from "@/integrations/service/helper";
import { HubsoftService } from "@/integrations/service/hubsoft.service";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import {
  buscarAuditoriasNaListaEspera,
  montarOrdensComAuditoria,
  moverParaFilaQualidade,
} from "@/integrations/useCase/helper";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MoveAuditsToQualityQueueUseCase {
  private readonly logger = new Logger(MoveAuditsToQualityQueueUseCase.name);

  constructor(
    private readonly hubsoftService: HubsoftService,
    private readonly hubsoftGetAtendimentosRepository: HubsoftGetAtendimentosRepository,
    private readonly hubsoftGetAtendimentoByIdRepository: HubsoftGetAtendimentoByIdRepository,
    private readonly hubsoftGetOrdensServicoRepository: HubsoftGetOrdensServicoRepository,
    private readonly hubsoftUpdateAtendimentoRepository: HubsoftUpdateAtendimentoRepository,
    private readonly hubsoftLogger: HubsoftLogger,
  ) {}

  async execute(host: Host): Promise<OrdemServicoListaItem[]> {
    //agora é multi-host, então não faz sentido limitar a fila de qualidade apenas para mania
    // if (host !== Host.MANIA) {
    //   this.logger.log(`Fila qualidade ignorada — host ${host} não é mania`);
    //   return [];
    // }

    this.logger.log(`Fila qualidade — buscando OS concluídas (${host})`);

    const token = await this.hubsoftService.garantirTokenValido(host);
    const dataInicio = formatDateYmd(getMostRecentThursday());
    const atendimentoPadrao = atendimentoPadraoPorHost[host];
    const auditoriasIndexadas = await buscarAuditoriasNaListaEspera({
      host,
      token,
      dataInicio,
      atendimentoPadrao,
      hubsoftGetAtendimentosRepository: this.hubsoftGetAtendimentosRepository,
      hubsoftGetAtendimentoByIdRepository:
        this.hubsoftGetAtendimentoByIdRepository,
    });
    const ordens = await this.hubsoftGetOrdensServicoRepository.execute(
      host,
      token,
    );
    const resultado = montarOrdensComAuditoria({
      host,
      ordens,
      atendimentoPadrao,
      auditoriasIndexadas,
    });

    return moverParaFilaQualidade({
      host,
      token,
      resultado,
      hubsoftUpdateAtendimentoRepository:
        this.hubsoftUpdateAtendimentoRepository,
      hubsoftLogger: this.hubsoftLogger,
      logger: this.logger,
    });
  }
}

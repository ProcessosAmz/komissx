import { Injectable, Logger } from '@nestjs/common';
import { Host } from '@/common/enums/host.enum';
import { atendimentoPadraoPorHost } from '@/integrations/constants/hubsoft/atendimentoPadrao.constants';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import {
  HubsoftGetAtendimentoByIdRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftGetOrdensServicoRepository,
  HubsoftUpdateAtendimentoRepository,
} from '@/integrations/repository/hubsoft';
import {
  formatDateYmd,
  getMostRecentThursday,
  isOsDesistenciaComAtendimentoInstalacao,
} from '@/integrations/service/helper';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { OrdemServicoListaItem } from '@/integrations/types/OrderServicoLista.type';
import {
  buscarAuditoriasNaListaEspera,
  fecharAuditoriasPorDesistencia,
  montarOrdensComAuditoria,
} from '@/integrations/useCase/helper';

@Injectable()
export class ListInstallationWithdrawalAuditsUseCase {
  private readonly logger = new Logger(
    ListInstallationWithdrawalAuditsUseCase.name,
  );

  constructor(
    private readonly hubsoftService: HubsoftService,
    private readonly hubsoftGetAtendimentosRepository: HubsoftGetAtendimentosRepository,
    private readonly hubsoftGetAtendimentoByIdRepository: HubsoftGetAtendimentoByIdRepository,
    private readonly hubsoftGetOrdensServicoRepository: HubsoftGetOrdensServicoRepository,
    private readonly hubsoftUpdateAtendimentoRepository: HubsoftUpdateAtendimentoRepository,
    private readonly hubsoftLogger: HubsoftLogger,
  ) {}

  async execute(host: Host): Promise<OrdemServicoListaItem[]> {
    if (host !== Host.MANIA) {
      this.logger.log(`Desistência ignorada — host ${host} não é mania`);
      return [];
    }

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
      {
        filtrarTipo: isOsDesistenciaComAtendimentoInstalacao,
        tipoData: 'data_cadastro',
      },
    );

    const resultado = montarOrdensComAuditoria({
      host,
      ordens,
      atendimentoPadrao,
      auditoriasIndexadas,
      filtrarOrdem: isOsDesistenciaComAtendimentoInstalacao,
    });

    return fecharAuditoriasPorDesistencia({
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
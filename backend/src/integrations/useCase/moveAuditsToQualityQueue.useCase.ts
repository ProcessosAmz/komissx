import { Host } from "@/common/enums/host.enum";
import { atendimentoPadraoPorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import {
  HubsoftGetAtendimentoByIdRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftGetOrdensServicoRepository,
} from "@/integrations/repository/hubsoft";
import {
  formatDateYmd,
  getMostRecentThursday,
} from "@/integrations/service/helper";
import { HubsoftService } from "@/integrations/service/hubsoft.service";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import { DispatchQualityQueueUseCase } from "@/integrations/useCase/dispatchQualityQueue.useCase";
import {
  buscarAuditoriasNaListaEspera,
  montarOrdensComAuditoria,
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
    private readonly dispatchQualityQueueUseCase: DispatchQualityQueueUseCase,
  ) {}

  async execute(host: Host): Promise<OrdemServicoListaItem[]> {
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

    const idsAtendimento = [
      ...new Set(resultado.map((ordem) => ordem.idAtendimento)),
    ];
    let totalAtualizados = 0;

    for (const idAtendimento of idsAtendimento) {
      const ordem = resultado.find(
        (item) => item.idAtendimento === idAtendimento,
      );

      if (!ordem) {
        continue;
      }

      const atualizado = await this.dispatchQualityQueueUseCase.execute({
        host,
        token,
        ordem,
      });

      if (atualizado) {
        totalAtualizados += 1;
      }
    }

    this.logger.log(
      `Fila qualidade — ${resultado.length} encontrados, ${totalAtualizados} atualizados (${host}) | clientes: ${resultado.map((ordem) => ordem.codigoCliente).join(", ") || "nenhum"} | atendimentos: ${idsAtendimento.join(", ") || "nenhum"}`,
    );

    return resultado.sort((esquerda, direita) =>
      direita.dataCadastro.localeCompare(esquerda.dataCadastro),
    );
  }
}
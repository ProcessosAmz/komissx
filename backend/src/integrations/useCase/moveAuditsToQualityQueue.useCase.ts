import { Host } from "@/common/enums/host.enum";
import {
  atendimentoPadraoPorHost,
  idUsuarioFilaQualidadePorHost,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import {
  HubsoftGetAtendimentosFilaQualidadeRepository,
  HubsoftGetOrdensServicoFilaQualidadeRepository,
} from "@/integrations/repository/hubsoft";
import { HubsoftService } from "@/integrations/service/hubsoft.service";
import { OrdemServicoListaItem } from "@/integrations/types/OrderServicoLista.type";
import {
  buscarAuditoriasNaListaEspera,
  montarOrdensComAuditoria,
} from "@/integrations/useCase/helper/filaQualidade.helper";
import {
  formatarDataYmdFilaQualidade,
  obterQuintaMaisRecenteFilaQualidade,
} from "@/integrations/useCase/helper/filaQualidade.ordem.helper";
import { MoveInstallationToQualityQueueUseCase } from "@/integrations/useCase/moveInstallationToQualityQueue.useCase";
import { Injectable, Logger } from "@nestjs/common";

export type MudancaFilaQualidade = {
  atualizado: boolean;
  idAtendimento: number | null;
  protocolo: string | null;
  codigoCliente: number | null;
  numeroOrdemServico: string | null;
  filaAnterior: string | null;
  idFilaAnterior: number | null;
  filaNova: string;
  idFilaNova: number | null;
};

export type MoverFilaQualidadeResult = {
  ordens: OrdemServicoListaItem[];
  mudancas: MudancaFilaQualidade[];
  totalAtualizados: number;
};

const NOME_FILA_QUALIDADE = "FILA QUALIDADE AUDITORIA";

@Injectable()
export class MoveAuditsToQualityQueueUseCase {
  private readonly logger = new Logger(MoveAuditsToQualityQueueUseCase.name);

  constructor(
    private readonly hubsoftService: HubsoftService,
    private readonly hubsoftGetAtendimentosFilaQualidadeRepository: HubsoftGetAtendimentosFilaQualidadeRepository,
    private readonly hubsoftGetOrdensServicoFilaQualidadeRepository: HubsoftGetOrdensServicoFilaQualidadeRepository,
    private readonly moveInstallationToQualityQueueUseCase: MoveInstallationToQualityQueueUseCase,
  ) {}

  async executeMoverTodos(host: Host): Promise<MoverFilaQualidadeResult> {
    const token = await this.hubsoftService.garantirTokenValido(host);
    const ordens = await this.listar(host, token);
    const mudancas = await this.moverTodos(host, token, ordens);
    const totalAtualizados = mudancas.filter(
      (mudanca) => mudanca.atualizado,
    ).length;

    this.logger.log(
      `Fila qualidade — PUT todos | ${totalAtualizados}/${ordens.length} atualizados para ${NOME_FILA_QUALIDADE} (${host})`,
    );

    return {
      ordens,
      mudancas,
      totalAtualizados,
    };
  }

  private async listar(
    host: Host,
    tokenInformado?: string,
  ): Promise<OrdemServicoListaItem[]> {
    this.logger.log(
      `Fila qualidade — listando auditoria de venda na lista de espera (${host})`,
    );

    const token =
      tokenInformado ?? (await this.hubsoftService.garantirTokenValido(host));
    const dataInicio = formatarDataYmdFilaQualidade(
      obterQuintaMaisRecenteFilaQualidade(),
    );
    const atendimentoPadrao = atendimentoPadraoPorHost[host];
    const auditoriasIndexadas = await buscarAuditoriasNaListaEspera({
      host,
      token,
      dataInicio,
      atendimentoPadrao,
      hubsoftGetAtendimentosFilaQualidadeRepository:
        this.hubsoftGetAtendimentosFilaQualidadeRepository,
    });
    const ordens =
      await this.hubsoftGetOrdensServicoFilaQualidadeRepository.execute(
        host,
        token,
      );

    this.logger.log(
      `Fila qualidade — ${ordens.length} OS de instalação finalizadas | ${auditoriasIndexadas.auditorias.length} tickets na lista de espera (${host})`,
    );

    const resultado = montarOrdensComAuditoria({
      host,
      ordens,
      atendimentoPadrao,
      auditoriasIndexadas,
    }).sort((esquerda, direita) =>
      direita.dataCadastro.localeCompare(esquerda.dataCadastro),
    );

    this.logger.log(
      `Fila qualidade — ${resultado.length} atendimentos COMERCIAL - AUDITORIA DE VENDA na lista de espera (${host}) | clientes: ${resultado.map((ordem) => ordem.codigoCliente).join(", ") || "nenhum"}`,
    );

    return resultado;
  }

  private async moverTodos(
    host: Host,
    token: string,
    ordens: OrdemServicoListaItem[],
  ): Promise<MudancaFilaQualidade[]> {
    const idFilaNova = idUsuarioFilaQualidadePorHost[host] ?? null;
    const mudancas: MudancaFilaQualidade[] = [];

    for (const ordem of ordens) {
      this.logger.log(
        `Fila qualidade — PUT | cliente ${ordem.codigoCliente} | protocolo ${ordem.protocolo} | atendimento ${ordem.idAtendimento} | OS ${ordem.numeroOrdemServico} | de ${ordem.nomeFila ?? "n/a"} (${ordem.idFila ?? "n/a"}) para ${NOME_FILA_QUALIDADE} (${idFilaNova ?? "n/a"}) (${host})`,
      );

      const atualizado = ordem.idAtendimento
        ? await this.moveInstallationToQualityQueueUseCase.execute({
            host,
            token,
            ordem,
          })
        : false;

      this.logger.log(
        `Fila qualidade — PUT resultado | atualizado=${atualizado} | atendimento ${ordem.idAtendimento} | protocolo ${ordem.protocolo} | cliente ${ordem.codigoCliente} (${host})`,
      );

      mudancas.push({
        atualizado,
        idAtendimento: ordem.idAtendimento,
        protocolo: ordem.protocolo,
        codigoCliente: ordem.codigoCliente,
        numeroOrdemServico: ordem.numeroOrdemServico,
        filaAnterior: ordem.nomeFila,
        idFilaAnterior: ordem.idFila,
        filaNova: NOME_FILA_QUALIDADE,
        idFilaNova,
      });
    }

    return mudancas;
  }
}

import { Host } from "@/common/enums/host.enum";
import {
  atendimentoPadraoPorHost,
  idUsuarioFilaQualidadePorHost,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { hubsoftConsole } from "@/integrations/logger/hubsoftConsole.logger";
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
import { Injectable } from "@nestjs/common";

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
  constructor(
    private readonly hubsoftService: HubsoftService,
    private readonly hubsoftGetAtendimentosFilaQualidadeRepository: HubsoftGetAtendimentosFilaQualidadeRepository,
    private readonly hubsoftGetOrdensServicoFilaQualidadeRepository: HubsoftGetOrdensServicoFilaQualidadeRepository,
    private readonly moveInstallationToQualityQueueUseCase: MoveInstallationToQualityQueueUseCase,
  ) {}

  async executeMoverTodos(host: Host): Promise<MoverFilaQualidadeResult> {
    hubsoftConsole.start(host, "update", "mover todos para FILA QUALIDADE");

    const token = await this.hubsoftService.garantirTokenValido(host);
    const ordens = await this.listar(host, token);
    const mudancas = await this.moverTodos(host, token, ordens);
    const totalAtualizados = mudancas.filter(
      (mudanca) => mudanca.atualizado,
    ).length;

    hubsoftConsole.success(
      host,
      "update",
      `${totalAtualizados}/${ordens.length} atualizados → ${NOME_FILA_QUALIDADE}`,
    );
    hubsoftConsole.end(
      host,
      "update",
      `${totalAtualizados}/${ordens.length} ok`,
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
    hubsoftConsole.info(
      host,
      "update",
      "listando auditorias na lista de espera",
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

    hubsoftConsole.info(
      host,
      "update",
      `${ordens.length} OS instalação finalizadas | ${auditoriasIndexadas.auditorias.length} tickets lista espera`,
    );

    const resultado = montarOrdensComAuditoria({
      host,
      ordens,
      atendimentoPadrao,
      auditoriasIndexadas,
    }).sort((esquerda, direita) =>
      direita.dataCadastro.localeCompare(esquerda.dataCadastro),
    );

    hubsoftConsole.info(
      host,
      "update",
      `${resultado.length} elegíveis | clientes: ${resultado.map((ordem) => ordem.codigoCliente).join(", ") || "nenhum"}`,
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
      hubsoftConsole.info(
        host,
        "update",
        `PUT cliente ${ordem.codigoCliente} | protocolo ${ordem.protocolo} | OS ${ordem.numeroOrdemServico} | ${ordem.nomeFila ?? "n/a"} → ${NOME_FILA_QUALIDADE}`,
      );

      const atualizado = ordem.idAtendimento
        ? await this.moveInstallationToQualityQueueUseCase.execute({
            host,
            token,
            ordem,
          })
        : false;

      if (atualizado) {
        hubsoftConsole.success(
          host,
          "update",
          `ok | atendimento ${ordem.idAtendimento} | cliente ${ordem.codigoCliente}`,
        );
      } else {
        hubsoftConsole.skip(
          host,
          "update",
          `não atualizado | atendimento ${ordem.idAtendimento ?? "n/a"} | cliente ${ordem.codigoCliente}`,
        );
      }

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

import { Host } from "@/common/enums/host.enum";
import {
  AtendimentoPadrao,
  estaNaListaEspera,
  idUsuarioFilaQualidadePorHost,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
import {
  HubsoftGetAtendimentoByIdRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftOrdemServicoListaItem,
  HubsoftUpdateAtendimentoRepository,
} from "@/integrations/repository/hubsoft";
import {
  HubsoftAtendimentoDetalhe,
  idsUsuariosResponsaveis,
  resolverCodigoClienteAtendimento,
  resolverIdClienteServicoAtendimento,
  resolverIdTipoAtendimentoDetalhe,
} from "@/integrations/repository/hubsoft/hubsoftGetAtendimentoById.repository";
import { isOsInstalacaoConcluida } from "@/integrations/service/helper/ordemServicoMotivoFechamento.helper";
import { formatDateYmd } from "@/integrations/service/helper/ordemServicoPeriodo.helper";
import { HubsoftAtendimento } from "@/integrations/types/OrdemServicoWebhook.type";
import {
  OrdemServicoListaItem,
  toOrdemServicoListaItem,
} from "@/integrations/types/OrderServicoLista.type";
import { getErrorMessage } from "@/utils/error.utils";
import { Logger } from "@nestjs/common";

export type AuditoriaComercial = {
  lista: HubsoftAtendimento;
  detalhe: HubsoftAtendimentoDetalhe;
};

export type AuditoriasIndexadas = {
  auditoriasPorServico: Map<number, AuditoriaComercial[]>;
  auditoriasPorCliente: Map<number, AuditoriaComercial[]>;
};

export const toId = (valor: unknown): number | null => {
  const numero = Number(valor);

  if (Number.isNaN(numero) || numero <= 0) {
    return null;
  }

  return numero;
};

export const isAtendimentoFinalizado = (message: string): boolean =>
  message.toLowerCase().includes("já finalizado");

export const adicionarAuditoria = (
  mapa: Map<number, AuditoriaComercial[]>,
  chave: number,
  item: AuditoriaComercial,
): void => {
  const existentes = mapa.get(chave) ?? [];
  existentes.push(item);
  mapa.set(chave, existentes);
};

export const buscarAuditoriasNaListaEspera = async (params: {
  host: Host;
  token: string;
  dataInicio: string;
  atendimentoPadrao: AtendimentoPadrao;
  hubsoftGetAtendimentosRepository: HubsoftGetAtendimentosRepository;
  hubsoftGetAtendimentoByIdRepository: HubsoftGetAtendimentoByIdRepository;
}): Promise<AuditoriasIndexadas> => {
  const dataFim = formatDateYmd(new Date());
  const auditorias =
    await params.hubsoftGetAtendimentosRepository.executeTodasPaginas(
      params.host,
      {
        pagina: 1,
        itens_por_pagina: 100,
        data_inicio: params.dataInicio,
        data_fim: dataFim,
        tipo_atendimento: String(params.atendimentoPadrao.id_tipo_atendimento),
        tipo_data: "data_cadastro",
      },
      params.token,
    );

  const auditoriasUnicas = [
    ...new Map<number, HubsoftAtendimento>(
      auditorias.map((auditoria) => [auditoria.id_atendimento, auditoria]),
    ).values(),
  ];

  const detalhes = await Promise.all(
    auditoriasUnicas.map(async (auditoriaLista) => {
      const detalhe = await params.hubsoftGetAtendimentoByIdRepository.execute(
        params.host,
        auditoriaLista.id_atendimento,
        params.token,
      );

      return { auditoriaLista, detalhe };
    }),
  );

  const auditoriasPorServico = new Map<number, AuditoriaComercial[]>();
  const auditoriasPorCliente = new Map<number, AuditoriaComercial[]>();

  for (const { auditoriaLista, detalhe } of detalhes) {
    if (!detalhe || detalhe.data_fechamento) {
      continue;
    }

    const tipo =
      resolverIdTipoAtendimentoDetalhe(detalhe) ??
      toId(auditoriaLista.id_tipo_atendimento);
    const matchTipo =
      tipo == null || tipo === params.atendimentoPadrao.id_tipo_atendimento;
    const dataCadastro = (
      detalhe.data_cadastro ??
      auditoriaLista.data_cadastro ??
      ""
    ).slice(0, 10);
    const matchData = !dataCadastro || dataCadastro >= params.dataInicio;
    const idsPivot = idsUsuariosResponsaveis(detalhe.usuarios_responsaveis);
    const matchListaEspera = estaNaListaEspera(
      params.host,
      idsPivot.map((idUsuario) => ({ id: idUsuario })),
      detalhe.id_usuario_responsavel,
    );

    if (!matchTipo || !matchData || !matchListaEspera) {
      continue;
    }

    const item: AuditoriaComercial = { lista: auditoriaLista, detalhe };
    const idClienteServico =
      resolverIdClienteServicoAtendimento(detalhe) ??
      toId(auditoriaLista.servico?.id_cliente_servico);
    const codigoCliente =
      resolverCodigoClienteAtendimento(detalhe) ??
      toId(auditoriaLista.cliente?.codigo_cliente);

    if (idClienteServico) {
      adicionarAuditoria(auditoriasPorServico, idClienteServico, item);
    }

    if (codigoCliente) {
      adicionarAuditoria(auditoriasPorCliente, codigoCliente, item);
    }
  }

  return { auditoriasPorServico, auditoriasPorCliente };
};

export const montarOrdensComAuditoria = (params: {
  host: Host;
  ordens: HubsoftOrdemServicoListaItem[];
  atendimentoPadrao: AtendimentoPadrao;
  auditoriasIndexadas: AuditoriasIndexadas;
}): OrdemServicoListaItem[] => {
  const idFilaListaEspera = params.atendimentoPadrao.id_usuario_responsavel;
  const resultado: OrdemServicoListaItem[] = [];
  const ordensConcluidas = params.ordens.filter((ordem) =>
    isOsInstalacaoConcluida(ordem),
  );

  for (const ordem of ordensConcluidas) {
    const idClienteServico =
      toId(ordem.id_cliente_servico) ??
      toId(ordem.dados_servico?.id_cliente_servico) ??
      toId(ordem.dados_cliente.id_cliente_servico);
    const codigoCliente = toId(ordem.dados_cliente.codigo_cliente);
    const auditoriasDoServico =
      (idClienteServico
        ? params.auditoriasIndexadas.auditoriasPorServico.get(idClienteServico)
        : undefined) ??
      (codigoCliente
        ? params.auditoriasIndexadas.auditoriasPorCliente.get(codigoCliente)
        : undefined);

    if (!auditoriasDoServico) {
      continue;
    }

    for (const auditoria of auditoriasDoServico) {
      const idServicoItem =
        idClienteServico ??
        toId(auditoria.lista.servico?.id_cliente_servico) ??
        resolverIdClienteServicoAtendimento(auditoria.detalhe);

      if (!idServicoItem) {
        continue;
      }

      const usuarioFila = (auditoria.detalhe.usuarios_responsaveis ?? []).find(
        (usuario) =>
          usuario.id === idFilaListaEspera ||
          usuario.id_usuario === idFilaListaEspera,
      );

      resultado.push(
        toOrdemServicoListaItem(ordem, params.host, idServicoItem, {
          idAtendimento: auditoria.detalhe.id_atendimento,
          protocolo: auditoria.detalhe.protocolo ?? auditoria.lista.protocolo,
          idTipoAtendimento:
            resolverIdTipoAtendimentoDetalhe(auditoria.detalhe) ??
            params.atendimentoPadrao.id_tipo_atendimento,
          idAtendimentoStatus: auditoria.detalhe.id_atendimento_status ?? null,
          idUsuarioResponsavel:
            auditoria.detalhe.id_usuario_responsavel ?? null,
          idFila:
            usuarioFila?.id ?? usuarioFila?.id_usuario ?? idFilaListaEspera,
          nomeFila: usuarioFila?.name ?? "LISTA DE ESPERA",
          dataCadastro:
            auditoria.detalhe.data_cadastro ?? auditoria.lista.data_cadastro,
        }),
      );
    }
  }

  return resultado;
};

export const moverParaFilaQualidade = async (params: {
  host: Host;
  token: string;
  resultado: OrdemServicoListaItem[];
  hubsoftUpdateAtendimentoRepository: HubsoftUpdateAtendimentoRepository;
  hubsoftLogger: HubsoftLogger;
  logger: Logger;
}): Promise<OrdemServicoListaItem[]> => {
  const idFilaQualidade = idUsuarioFilaQualidadePorHost[params.host];
  const idsAtualizados = new Set<number>();
  const idsAtendimento = [
    ...new Set(params.resultado.map((ordem) => ordem.idAtendimento)),
  ];

  if (idFilaQualidade) {
    const bodyPut = {
      fechar_atendimento: false,
      id_usuario_responsavel: idFilaQualidade,
    };

    for (const idAtendimento of idsAtendimento) {
      const ordemAtualizada = params.resultado.find(
        (ordem) => ordem.idAtendimento === idAtendimento,
      );

      try {
        await params.hubsoftUpdateAtendimentoRepository.execute(
          params.host,
          idAtendimento,
          bodyPut,
          params.token,
        );
        idsAtualizados.add(idAtendimento);
        params.logger.log(
          `Fila qualidade — movido | cliente ${ordemAtualizada?.codigoCliente} | atendimento ${idAtendimento} | protocolo ${ordemAtualizada?.protocolo} | OS ${ordemAtualizada?.numeroOrdemServico} | id_cliente_servico ${ordemAtualizada?.idClienteServico} | id_ordem_servico ${ordemAtualizada?.id} (${params.host})`,
        );
        await params.hubsoftLogger.filaQualidade({
          action: "qualidade_atualizado",
          message: `Atendimento ${idAtendimento} movido para FILA QUALIDADE AUDITORIA`,
          host: params.host,
          entityId: idAtendimento,
          data: {
            host: params.host,
            idAtendimento,
            codigoCliente: ordemAtualizada?.codigoCliente,
            idFila: idFilaQualidade,
            nomeFila: "FILA QUALIDADE AUDITORIA",
            idUsuarioResponsavel: idFilaQualidade,
          },
        });
      } catch (error) {
        const message = getErrorMessage(error);

        if (isAtendimentoFinalizado(message)) {
          params.logger.log(
            `Fila qualidade — ignorado | cliente ${ordemAtualizada?.codigoCliente} | atendimento ${idAtendimento} | protocolo ${ordemAtualizada?.protocolo} | OS ${ordemAtualizada?.numeroOrdemServico} (${params.host}) — atendimento já finalizado`,
          );
          continue;
        }

        params.logger.error(
          `Fila qualidade — erro | cliente ${ordemAtualizada?.codigoCliente} | atendimento ${idAtendimento} | protocolo ${ordemAtualizada?.protocolo} | OS ${ordemAtualizada?.numeroOrdemServico} (${params.host}) — ${message}`,
        );
        await params.hubsoftLogger.filaQualidade({
          action: "qualidade_erro",
          message: `PUT qualidade ERRO idAtendimento=${idAtendimento} message=${message}`,
          host: params.host,
          entityId: idAtendimento,
          data: {
            host: params.host,
            idAtendimento,
            codigoCliente: ordemAtualizada?.codigoCliente,
            motivo: message,
          },
        });
      }
    }
  }

  const resultadoAtualizado = params.resultado.map((ordem) => {
    if (!idsAtualizados.has(ordem.idAtendimento) || !idFilaQualidade) {
      return ordem;
    }

    return {
      ...ordem,
      idFila: idFilaQualidade,
      nomeFila: "FILA QUALIDADE AUDITORIA",
      idUsuarioResponsavel: idFilaQualidade,
    };
  });

  params.logger.log(
    `Fila qualidade — ${params.resultado.length} encontrados, ${idsAtualizados.size} atualizados (${params.host}) | clientes: ${params.resultado.map((ordem) => ordem.codigoCliente).join(", ") || "nenhum"} | atendimentos: ${idsAtendimento.join(", ") || "nenhum"}`,
  );

  return resultadoAtualizado.sort((esquerda, direita) =>
    direita.dataCadastro.localeCompare(esquerda.dataCadastro),
  );
};

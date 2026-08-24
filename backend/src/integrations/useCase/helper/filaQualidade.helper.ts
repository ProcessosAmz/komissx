import { Host } from "@/common/enums/host.enum";
import { OrdemServicoStatus } from "@/common/enums/OrdemServicoStatus.enum";
import {
  AtendimentoPadrao,
  estaNaListaEspera,
  idTipoAtendimentoMudancaEnderecoPorHost,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import {
  HubsoftGetAtendimentoByIdRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftOrdemServicoListaItem,
} from "@/integrations/repository/hubsoft";
import {
  HubsoftAtendimentoDetalhe,
  idsUsuariosResponsaveis,
  resolverCodigoClienteAtendimento,
  resolverIdClienteServicoAtendimento,
  resolverIdTipoAtendimentoDetalhe,
} from "@/integrations/repository/hubsoft/hubsoftGetAtendimentoById.repository";
import { isOsElegivelParaFila } from "@/integrations/service/helper/ordemServicoMotivoFechamento.helper";
import { formatDateYmd } from "@/integrations/service/helper/ordemServicoPeriodo.helper";
import { resolverCategoriaOrdemServico } from "@/integrations/service/helper/ordemServicoTipo.helper";
import { HubsoftAtendimento } from "@/integrations/types/OrdemServicoWebhook.type";
import {
  OrdemServicoListaItem,
  toOrdemServicoListaItem,
} from "@/integrations/types/OrderServicoLista.type";

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

    if (!matchTipo || !matchData) {
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

const montarItemDaOs = (params: {
  host: Host;
  ordem: HubsoftOrdemServicoListaItem;
  atendimentoPadrao: AtendimentoPadrao;
  categoria: OrdemServicoListaItem["categoriaOrdemServico"];
  idClienteServico: number;
}): OrdemServicoListaItem | null => {
  const idAtendimento = toId(params.ordem.atendimento?.id_atendimento);
  const tipoAtendimento = toId(params.ordem.atendimento?.id_tipo_atendimento);

  if (!idAtendimento) {
    return null;
  }

  if (
    tipoAtendimento === params.atendimentoPadrao.id_tipo_atendimento
  ) {
    return null;
  }

  const idTipoMudanca = idTipoAtendimentoMudancaEnderecoPorHost[params.host];

  if (
    params.categoria === OrdemServicoStatus.MUDANCA_ENDERECO &&
    tipoAtendimento !== idTipoMudanca
  ) {
    return null;
  }

  return toOrdemServicoListaItem(
    params.ordem,
    params.host,
    params.idClienteServico,
    {
      idAtendimento,
      protocolo: params.ordem.atendimento.protocolo,
      idTipoAtendimento:
        tipoAtendimento ?? params.atendimentoPadrao.id_tipo_atendimento,
      idAtendimentoStatus:
        params.ordem.atendimento.id_status_atendimento ?? null,
      idUsuarioResponsavel: null,
      idFila: params.atendimentoPadrao.id_usuario_responsavel,
      nomeFila: "LISTA DE ESPERA",
      dataCadastro: params.ordem.data_cadastro,
      categoriaOrdemServico: params.categoria,
      idTipoOrdemServico: params.ordem.tipo_ordem_servico.id_tipo_ordem_servico,
    },
  );
};

export const montarOrdensComAuditoria = (params: {
  host: Host;
  ordens: HubsoftOrdemServicoListaItem[];
  atendimentoPadrao: AtendimentoPadrao;
  auditoriasIndexadas: AuditoriasIndexadas;
}): OrdemServicoListaItem[] => {
  const resultado: OrdemServicoListaItem[] = [];

  for (const ordem of params.ordens) {
    const categoria = resolverCategoriaOrdemServico(
      params.host,
      ordem.tipo_ordem_servico.id_tipo_ordem_servico,
    );

    if (!categoria || !isOsElegivelParaFila(ordem, categoria)) {
      continue;
    }

    const idClienteServico =
      toId(ordem.id_cliente_servico) ??
      toId(ordem.dados_servico?.id_cliente_servico) ??
      toId(ordem.dados_cliente.id_cliente_servico);

    if (!idClienteServico) {
      continue;
    }

    if (
      categoria === OrdemServicoStatus.MUDANCA_ENDERECO ||
      categoria === OrdemServicoStatus.NAO_CONFORMIDADE
    ) {
      const item = montarItemDaOs({
        host: params.host,
        ordem,
        atendimentoPadrao: params.atendimentoPadrao,
        categoria,
        idClienteServico,
      });

      if (item) {
        resultado.push(item);
      }

      continue;
    }

    const codigoCliente = toId(ordem.dados_cliente.codigo_cliente);
    const auditoriasDoServico =
      params.auditoriasIndexadas.auditoriasPorServico.get(idClienteServico) ??
      (codigoCliente
        ? params.auditoriasIndexadas.auditoriasPorCliente.get(codigoCliente)
        : undefined);

    if (!auditoriasDoServico) {
      continue;
    }

    for (const auditoria of auditoriasDoServico) {
      const tipoAtendimento =
        resolverIdTipoAtendimentoDetalhe(auditoria.detalhe) ??
        toId(auditoria.lista.id_tipo_atendimento);

      if (tipoAtendimento !== params.atendimentoPadrao.id_tipo_atendimento) {
        continue;
      }

      const idsPivot = idsUsuariosResponsaveis(
        auditoria.detalhe.usuarios_responsaveis,
      );
      const naListaEspera = estaNaListaEspera(
        params.host,
        idsPivot.map((idUsuario) => ({ id: idUsuario })),
        auditoria.detalhe.id_usuario_responsavel,
      );

      if (!naListaEspera) {
        continue;
      }

      const idFilaListaEspera = params.atendimentoPadrao.id_usuario_responsavel;
      const usuarioFila = (auditoria.detalhe.usuarios_responsaveis ?? []).find(
        (usuario) =>
          usuario.id === idFilaListaEspera ||
          usuario.id_usuario === idFilaListaEspera,
      );

      resultado.push(
        toOrdemServicoListaItem(ordem, params.host, idClienteServico, {
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
          categoriaOrdemServico: categoria,
          idTipoOrdemServico: ordem.tipo_ordem_servico.id_tipo_ordem_servico,
        }),
      );
    }
  }

  return resultado;
};
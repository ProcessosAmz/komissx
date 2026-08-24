import { Host } from "@/common/enums/host.enum";
import { OrdemServicoStatus } from "@/common/enums/OrdemServicoStatus.enum";
import {
  AtendimentoPadrao,
  estaNaListaEspera,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import {
  HubsoftGetAtendimentosRepository,
  HubsoftOrdemServicoListaItem,
} from "@/integrations/repository/hubsoft";
import { isOsElegivelParaFila } from "@/integrations/service/helper/ordemServicoMotivoFechamento.helper";
import { formatDateYmd } from "@/integrations/service/helper/ordemServicoPeriodo.helper";
import { resolverCategoriaOrdemServico } from "@/integrations/service/helper/ordemServicoTipo.helper";
import { HubsoftAtendimento } from "@/integrations/types/OrdemServicoWebhook.type";
import {
  OrdemServicoListaItem,
  toOrdemServicoListaItem,
} from "@/integrations/types/OrderServicoLista.type";

export type AuditoriaComercial = HubsoftAtendimento;

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

const resolverTipoLista = (auditoria: HubsoftAtendimento): number | null => {
  const direto = toId(auditoria.id_tipo_atendimento);

  if (direto) {
    return direto;
  }

  const tipo = auditoria.tipo_atendimento;

  if (tipo && typeof tipo === "object" && "id_tipo_atendimento" in tipo) {
    return toId(
      (tipo as { id_tipo_atendimento: number }).id_tipo_atendimento,
    );
  }

  return null;
};

export const buscarAuditoriasNaListaEspera = async (params: {
  host: Host;
  token: string;
  dataInicio: string;
  atendimentoPadrao: AtendimentoPadrao;
  hubsoftGetAtendimentosRepository: HubsoftGetAtendimentosRepository;
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

  const auditoriasPorServico = new Map<number, AuditoriaComercial[]>();
  const auditoriasPorCliente = new Map<number, AuditoriaComercial[]>();

  for (const auditoria of auditoriasUnicas) {
    if (auditoria.data_fechamento) {
      continue;
    }

    const tipo = resolverTipoLista(auditoria);
    const matchTipo =
      tipo == null || tipo === params.atendimentoPadrao.id_tipo_atendimento;
    const dataCadastro = (auditoria.data_cadastro ?? "").slice(0, 10);
    const matchData = !dataCadastro || dataCadastro >= params.dataInicio;

    if (!matchTipo || !matchData) {
      continue;
    }

    const idClienteServico = toId(auditoria.servico?.id_cliente_servico);
    const codigoCliente = toId(auditoria.cliente?.codigo_cliente);

    if (idClienteServico) {
      adicionarAuditoria(auditoriasPorServico, idClienteServico, auditoria);
    }

    if (codigoCliente) {
      adicionarAuditoria(auditoriasPorCliente, codigoCliente, auditoria);
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
  const resultado: OrdemServicoListaItem[] = [];

  for (const ordem of params.ordens) {
    const categoria = resolverCategoriaOrdemServico(
      params.host,
      ordem.tipo_ordem_servico.id_tipo_ordem_servico,
    );

    if (!categoria || !isOsElegivelParaFila(ordem, categoria)) {
      continue;
    }

    if (categoria !== OrdemServicoStatus.INSTALACAO) {
      continue;
    }

    const idClienteServico =
      toId(ordem.id_cliente_servico) ??
      toId(ordem.dados_servico?.id_cliente_servico) ??
      toId(ordem.dados_cliente.id_cliente_servico);

    if (!idClienteServico) {
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
      const tipoAtendimento = resolverTipoLista(auditoria);

      if (tipoAtendimento !== params.atendimentoPadrao.id_tipo_atendimento) {
        continue;
      }

      const naListaEspera = estaNaListaEspera(
        params.host,
        auditoria.usuarios_responsaveis,
        auditoria.id_usuario_responsavel,
      );

      if (!naListaEspera) {
        continue;
      }

      const idFilaListaEspera = params.atendimentoPadrao.id_usuario_responsavel;
      const usuarioFila = (auditoria.usuarios_responsaveis ?? []).find(
        (usuario) => usuario.id === idFilaListaEspera,
      );

      resultado.push(
        toOrdemServicoListaItem(ordem, params.host, idClienteServico, {
          idAtendimento: auditoria.id_atendimento,
          protocolo: auditoria.protocolo,
          idTipoAtendimento:
            tipoAtendimento ?? params.atendimentoPadrao.id_tipo_atendimento,
          idAtendimentoStatus: auditoria.id_atendimento_status ?? null,
          idUsuarioResponsavel: auditoria.id_usuario_responsavel ?? null,
          idFila: usuarioFila?.id ?? idFilaListaEspera,
          nomeFila: usuarioFila?.name ?? "LISTA DE ESPERA",
          dataCadastro: auditoria.data_cadastro,
          categoriaOrdemServico: categoria,
          idTipoOrdemServico: ordem.tipo_ordem_servico.id_tipo_ordem_servico,
        }),
      );
    }
  }

  return resultado;
};
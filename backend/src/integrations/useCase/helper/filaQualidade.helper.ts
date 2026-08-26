import { Host } from "@/common/enums/host.enum";
import { OrdemServicoStatus } from "@/common/enums/OrdemServicoStatus.enum";
import {
  AtendimentoPadrao,
  estaNaListaEspera,
} from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import {
  HubsoftGetAtendimentosFilaQualidadeRepository,
  HubsoftOrdemServicoListaItemFilaQualidade,
} from "@/integrations/repository/hubsoft";
import { HubsoftAtendimento } from "@/integrations/types/OrdemServicoWebhook.type";
import {
  OrdemServicoListaItem,
  resolverUsuarioAbertura,
  toOrdemServicoListaItem,
} from "@/integrations/types/OrderServicoLista.type";
import {
  formatarDataYmdFilaQualidade,
  isOsElegivelParaFilaQualidade,
  resolverCategoriaOrdemServicoFilaQualidade,
} from "@/integrations/useCase/helper/filaQualidade.ordem.helper";

export type AuditoriaComercial = HubsoftAtendimento;

const NOME_TIPO_AUDITORIA_VENDA = "auditoria de venda";
const NOME_FILA_LISTA_ESPERA = "lista de espera";
const NOME_STATUS_AGUARDANDO_ANALISE = "aguardando analise";

const normalizarTexto = (valor: string): string =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export type AuditoriasIndexadas = {
  auditorias: AuditoriaComercial[];
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

const resolverNomeTipo = (auditoria: HubsoftAtendimento): string => {
  const tipo = auditoria.tipo_atendimento;

  if (typeof tipo === "string") {
    return tipo;
  }

  if (tipo && typeof tipo === "object" && "descricao" in tipo) {
    return String((tipo as { descricao?: string }).descricao ?? "");
  }

  return "";
};

export const isAtendimentoAuditoriaDeVenda = (
  auditoria: HubsoftAtendimento,
  idTipoPadrao: number,
): boolean => {
  const tipoId = resolverTipoLista(auditoria);

  if (tipoId === idTipoPadrao) {
    return true;
  }

  return normalizarTexto(resolverNomeTipo(auditoria)).includes(
    NOME_TIPO_AUDITORIA_VENDA,
  );
};

const resolverNomeStatus = (auditoria: HubsoftAtendimento): string => {
  const status = auditoria.status;

  if (typeof status === "string") {
    return status;
  }

  if (status && typeof status === "object") {
    return String(status.descricao ?? "");
  }

  return "";
};

const resolverNomeFila = (auditoria: HubsoftAtendimento): string => {
  const fila = auditoria.usuario_responsavel;

  if (typeof fila === "string") {
    return fila;
  }

  if (fila && typeof fila === "object") {
    return String(fila.name ?? "");
  }

  return "";
};

const resolverUsuariosFila = (
  auditoria: HubsoftAtendimento,
): { id: number; name?: string }[] =>
  (auditoria.usuarios_responsaveis ?? [])
    .map((usuario) => ({
      id:
        toId(usuario.id) ??
        toId(usuario.id_usuario) ??
        toId(usuario.pivot?.id_usuario) ??
        0,
      name: usuario.name,
    }))
    .filter((usuario) => usuario.id > 0);

export const resolverIdClienteServicoLista = (
  auditoria: HubsoftAtendimento,
): number | null =>
  toId(auditoria.id_cliente_servico) ??
  toId(auditoria.servico?.id_cliente_servico) ??
  toId(auditoria.cliente_servico?.id_cliente_servico);

export const resolverCodigoClienteLista = (
  auditoria: HubsoftAtendimento,
): number | null =>
  toId(auditoria.cliente?.codigo_cliente) ??
  toId(auditoria.cliente_servico?.cliente?.codigo_cliente);

export const isAtendimentoNaListaEspera = (
  host: Host,
  auditoria: HubsoftAtendimento,
): boolean => {
  if (
    estaNaListaEspera(
      host,
      resolverUsuariosFila(auditoria),
      auditoria.id_usuario_responsavel,
    )
  ) {
    return true;
  }

  const nomesFila = [
    resolverNomeFila(auditoria),
    resolverNomeStatus(auditoria),
    String(auditoria.setor_responsavel ?? ""),
    String(auditoria.destino ?? ""),
    ...resolverUsuariosFila(auditoria).map((usuario) => usuario.name ?? ""),
  ];

  if (
    nomesFila.some((nome) =>
      normalizarTexto(nome).includes(NOME_FILA_LISTA_ESPERA),
    )
  ) {
    return true;
  }

  const semResponsavel =
    resolverUsuariosFila(auditoria).length === 0 &&
    toId(auditoria.id_usuario_responsavel) == null &&
    !resolverNomeFila(auditoria);

  if (!semResponsavel) {
    return false;
  }

  return normalizarTexto(resolverNomeStatus(auditoria)).includes(
    NOME_STATUS_AGUARDANDO_ANALISE,
  );
};

export const buscarAuditoriasNaListaEspera = async (params: {
  host: Host;
  token: string;
  dataInicio: string;
  atendimentoPadrao: AtendimentoPadrao;
  hubsoftGetAtendimentosFilaQualidadeRepository: HubsoftGetAtendimentosFilaQualidadeRepository;
}): Promise<AuditoriasIndexadas> => {
  const dataFim = formatarDataYmdFilaQualidade(new Date());
  const auditorias =
    await params.hubsoftGetAtendimentosFilaQualidadeRepository.executeTodasPaginas(
      params.host,
      {
        pagina: 0,
        itens_por_pagina: 100,
        data_inicio: params.dataInicio,
        data_fim: dataFim,
        tipo_atendimento: String(params.atendimentoPadrao.id_tipo_atendimento),
        tipo_data: "data_cadastro",
        relacoes: "cliente_servico,usuarios_responsaveis",
      },
      params.token,
    );

  const auditoriasUnicas = [
    ...new Map<number, HubsoftAtendimento>(
      auditorias.map((auditoria) => [auditoria.id_atendimento, auditoria]),
    ).values(),
  ];

  const auditoriasFiltradas: AuditoriaComercial[] = [];
  const auditoriasPorServico = new Map<number, AuditoriaComercial[]>();
  const auditoriasPorCliente = new Map<number, AuditoriaComercial[]>();

  for (const auditoria of auditoriasUnicas) {
    if (auditoria.data_fechamento) {
      continue;
    }

    if (
      !isAtendimentoAuditoriaDeVenda(
        auditoria,
        params.atendimentoPadrao.id_tipo_atendimento,
      )
    ) {
      continue;
    }

    if (!isAtendimentoNaListaEspera(params.host, auditoria)) {
      continue;
    }

    const dataCadastro = (auditoria.data_cadastro ?? "").slice(0, 10);
    const matchData = !dataCadastro || dataCadastro >= params.dataInicio;

    if (!matchData) {
      continue;
    }

    const idClienteServico = resolverIdClienteServicoLista(auditoria);
    const codigoCliente = resolverCodigoClienteLista(auditoria);

    if (!idClienteServico && !codigoCliente) {
      continue;
    }

    auditoriasFiltradas.push(auditoria);

    if (idClienteServico) {
      adicionarAuditoria(auditoriasPorServico, idClienteServico, auditoria);
    }

    if (codigoCliente) {
      adicionarAuditoria(auditoriasPorCliente, codigoCliente, auditoria);
    }
  }

  return {
    auditorias: auditoriasFiltradas,
    auditoriasPorServico,
    auditoriasPorCliente,
  };
};

export const montarOrdensComAuditoria = (params: {
  host: Host;
  ordens: HubsoftOrdemServicoListaItemFilaQualidade[];
  atendimentoPadrao: AtendimentoPadrao;
  auditoriasIndexadas: AuditoriasIndexadas;
}): OrdemServicoListaItem[] => {
  const resultado: OrdemServicoListaItem[] = [];

  for (const ordem of params.ordens) {
    const categoria = resolverCategoriaOrdemServicoFilaQualidade(
      params.host,
      ordem.tipo_ordem_servico.id_tipo_ordem_servico,
    );

    if (!categoria || !isOsElegivelParaFilaQualidade(ordem, categoria)) {
      continue;
    }

    if (categoria !== OrdemServicoStatus.INSTALACAO) {
      continue;
    }

    const idClienteServico =
      toId(ordem.id_cliente_servico) ??
      toId(ordem.dados_servico?.id_cliente_servico) ??
      toId(ordem.dados_cliente.id_cliente_servico) ??
      0;

    const codigoCliente = toId(ordem.dados_cliente.codigo_cliente);
    const auditoriasDoServico =
      params.auditoriasIndexadas.auditoriasPorServico.get(idClienteServico) ??
      (codigoCliente
        ? params.auditoriasIndexadas.auditoriasPorCliente.get(codigoCliente)
        : undefined) ??
      [];

    const auditoriasElegiveis = auditoriasDoServico.filter(
      (auditoria) =>
        isAtendimentoAuditoriaDeVenda(
          auditoria,
          params.atendimentoPadrao.id_tipo_atendimento,
        ) && isAtendimentoNaListaEspera(params.host, auditoria),
    );

    if (auditoriasElegiveis.length === 0) {
      continue;
    }

    const idFilaListaEspera = params.atendimentoPadrao.id_usuario_responsavel;
    const auditoria = auditoriasElegiveis[0];
    const tipoAtendimento = resolverTipoLista(auditoria);
    const usuarioFila = (auditoria.usuarios_responsaveis ?? []).find(
      (usuario) =>
        usuario.id === idFilaListaEspera ||
        usuario.id_usuario === idFilaListaEspera ||
        usuario.pivot?.id_usuario === idFilaListaEspera,
    );
    const abertura = resolverUsuarioAbertura(
      auditoria.usuario_abertura,
      auditoria.id_usuario_abertura,
    );

    resultado.push(
      toOrdemServicoListaItem(
        ordem,
        params.host,
        idClienteServico,
        {
          idAtendimento: auditoria.id_atendimento,
          protocolo: auditoria.protocolo,
          idTipoAtendimento:
            tipoAtendimento ?? params.atendimentoPadrao.id_tipo_atendimento,
          idAtendimentoStatus: auditoria.id_atendimento_status ?? null,
          idUsuarioResponsavel: auditoria.id_usuario_responsavel ?? null,
          idUsuarioAbertura: abertura.id,
          usuarioAbertura: abertura.nome,
          idFila: usuarioFila?.id ?? idFilaListaEspera,
          nomeFila: usuarioFila?.name ?? "LISTA DE ESPERA",
          dataCadastro: auditoria.data_cadastro,
          categoriaOrdemServico: categoria,
          idTipoOrdemServico: ordem.tipo_ordem_servico.id_tipo_ordem_servico,
        },
        categoria,
      ),
    );
  }

  return resultado;
};

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import {
  atendimentoPadraoPorHost,
  estaNaListaEspera,
  idUsuarioFilaQualidadePorHost,
} from '@/integrations/constants/hubsoft/atendimentoPadrao.constants';
import {
  OrdemServicoWebhook,
  HubsoftTokenResponse,
  HostTokenState,
  CreateTicketResult,
  HubsoftAtendimento,
} from '@/integrations/types/OrdemServicoWebhook.type';
import { getErrorMessage } from '@/utils/error.utils';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import { RedisService } from '@/integrations/redis/service/index.service';
import {
  resolveOrdemServicoHost,
  isOrdemDeInstalacao,
  claimWebhookTicket,
  releaseWebhookTicket,
  isOsInstalacaoConcluida,
  formatDateYmd,
  getMostRecentThursday,
} from '@/integrations/service/helper';
import {
  OrdemServicoListaItem,
  toOrdemServicoListaItem,
} from '../types/OrderServicoLista.type';
import {
  HubsoftCreateAtendimentoRepository,
  HubsoftGetAtendimentoByIdRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftGetAtendimentosCreateTicketRepository,
  HubsoftGetByIdClienteRepository,
  HubsoftGetOrdensServicoRepository,
  HubsoftUpdateAtendimentoRepository,
} from '@/integrations/repository/hubsoft';
import {
  HubsoftAtendimentoDetalhe,
  idsUsuariosResponsaveis,
  resolverCodigoClienteAtendimento,
  resolverIdClienteServicoAtendimento,
  resolverIdTipoAtendimentoDetalhe,
} from '@/integrations/repository/hubsoft/hubsoftGetAtendimentoById.repository';

type AuditoriaComercial = {
  lista: HubsoftAtendimento;
  detalhe: HubsoftAtendimentoDetalhe;
};

const toId = (valor: unknown): number | null => {
  const numero = Number(valor);

  if (Number.isNaN(numero) || numero <= 0) {
    return null;
  }

  return numero;
};

@Injectable()
export class HubsoftService {
  private readonly logger = new Logger(HubsoftService.name);
  private readonly tokens: Partial<Record<Host, HostTokenState>> = {};

  constructor(
    private readonly httpService: HttpService,
    private readonly hubsoftGetByIdClienteRepository: HubsoftGetByIdClienteRepository,
    private readonly hubsoftCreateAtendimentoRepository: HubsoftCreateAtendimentoRepository,
    private readonly hubsoftGetAtendimentosRepository: HubsoftGetAtendimentosRepository,
    private readonly hubsoftGetOrdensServicoRepository: HubsoftGetOrdensServicoRepository,
    private readonly hubsoftGetAtendimentoByIdRepository: HubsoftGetAtendimentoByIdRepository,
    private readonly hubsoftUpdateAtendimentoRepository: HubsoftUpdateAtendimentoRepository,
    private readonly hubsoftGetAtendimentosCreateTicketRepository: HubsoftGetAtendimentosCreateTicketRepository,
    private readonly hubsoftLogger: HubsoftLogger,
    private readonly redisService: RedisService,
  ) { }

  private async garantirTokenValido(host: Host): Promise<string> {
    const agora = Date.now();
    const tokenAtual = this.tokens[host];

    if (tokenAtual && agora < tokenAtual.expiresAt) {
      return tokenAtual.accessToken;
    }

    return this.logarHubsoft(host);
  }

  private async logarHubsoft(host: Host): Promise<string> {
    const config = getHubsoftConfig(host);

    if (!config.url) {
      throw new Error(`HUB_URL não configurada para o host ${host}`);
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', config.clientId);
      params.append('client_secret', config.clientSecret);
      params.append('grant_type', config.grantType);
      params.append('username', config.username);
      params.append('password', config.password);

      const response = await firstValueFrom(
        this.httpService.post<HubsoftTokenResponse>(
          `${config.url}/oauth/token`,
          params,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      const accessToken = response.data.access_token;
      this.tokens[host] = {
        accessToken,
        expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
      };

      return accessToken;
    } catch (error) {
      this.logAndRethrow(`Erro ao logar no Hubsoft (${host})`, error);
    }
  }

  async createTicket(
    payload: OrdemServicoWebhook,
  ): Promise<CreateTicketResult | null> {
    const numeroOrdem = payload.body.numero_ordem_servico;
    const host = resolveOrdemServicoHost(numeroOrdem);

    if (!host) {
      this.logger.log(
        `Ticket ignorado — OS ${numeroOrdem} — prefixo de host inválido`,
      );
      return null;
    }

    if (host !== Host.MANIA) {
      this.logger.log(
        `Ticket ignorado — OS ${numeroOrdem} — host ${host} não é mania`,
      );
      return null;
    }

    const instalacao = isOrdemDeInstalacao(
      host,
      payload.body.id_tipo_ordem_servico,
    );

    if (!instalacao) {
      this.logger.log(
        `Ticket ignorado — OS ${numeroOrdem} — tipo ${payload.body.id_tipo_ordem_servico} não é instalação (${host})`,
      );
      return null;
    }

    const ordemServicoId = payload.body.id_ordem_servico;
    const claimed = await claimWebhookTicket(
      this.redisService,
      host,
      ordemServicoId,
    );

    if (!claimed) {
      this.logger.log(
        `Ticket duplicado — OS ${numeroOrdem} — webhook já processado (${host})`,
      );
      return {
        message: 'Webhook já processado',
        duplicate: true,
      };
    }

    try {
      const token = await this.garantirTokenValido(host);
      const atendimentoPadrao = atendimentoPadraoPorHost[host];
      const idClienteServico = payload.body.id_cliente_servico;

      const cliente = await this.hubsoftGetByIdClienteRepository.execute(
        host,
        idClienteServico,
        token,
      );

      if (!cliente) {
        await releaseWebhookTicket(this.redisService, host, ordemServicoId);
        this.logger.log(
          `Ticket erro — OS ${numeroOrdem} — cliente não encontrado id_cliente_servico ${idClienteServico} (${host})`,
        );
        await this.hubsoftLogger.createTicket({
          action: 'create_error',
          message: `Cliente não encontrado para id_cliente_servico=${idClienteServico}`,
          host,
          isInstalacao: instalacao,
          payload: payload.body,
          cliente: null,
        });
        return null;
      }

      const nome = cliente.nome;
      const telefone = cliente.telefone;
      const email = cliente.email;

      const hoje = new Date().toISOString().slice(0, 10);
      const atendimentosExistentes =
        await this.hubsoftGetAtendimentosCreateTicketRepository.execute(
          host,
          {
            pagina: 1,
            itens_por_pagina: 50,
            data_inicio: hoje,
            data_fim: hoje,
            tipo_atendimento: String(atendimentoPadrao.id_tipo_atendimento),
            status_atendimento: String(atendimentoPadrao.id_atendimento_status),
            id_servico: idClienteServico,
            tipo_data: 'data_cadastro',
          },
          token,
        );
      const jaExisteNesteCliente = atendimentosExistentes.some(
        (atendimento) =>
          Number(atendimento.servico?.id_cliente_servico) === idClienteServico,
      );

      if (jaExisteNesteCliente) {
        this.logger.log(
          `Ticket duplicado — OS ${numeroOrdem} — atendimento 475 já existe para o cliente (${host})`,
        );
        return {
          message: 'Atendimento de auditoria já existe para o cliente',
          duplicate: true,
        };
      }

      const requestBody = {
        id_cliente_servico: idClienteServico,
        id_usuario_abertura: payload.body.id_usuario_abertura,
        ...atendimentoPadrao,
        nome,
        telefone,
        email,
      };

      const atendimento = await this.hubsoftCreateAtendimentoRepository.execute(
        host,
        requestBody,
        token,
      );

      await this.hubsoftLogger.createTicket({
        action: 'create',
        message: 'Atendimento criado com sucesso',
        host,
        isInstalacao: instalacao,
        payload: payload.body,
        cliente,
        atendimento,
      });

      this.logger.log(
        `Ticket criado — cliente ${atendimento.cliente.codigo_cliente} — OS ${numeroOrdem} (${host})`,
      );

      return {
        message: 'Atendimento criado com sucesso',
      };
    } catch (error) {
      await releaseWebhookTicket(this.redisService, host, ordemServicoId);
      await this.hubsoftLogger.createTicket({
        action: 'create_error',
        message: `Erro ao criar atendimento no Hubsoft: ${getErrorMessage(error)}`,
        host,
        isInstalacao: instalacao,
        payload: payload.body,
      });
      this.logAndRethrow('Erro ao criar atendimento no Hubsoft', error);
    }
  }

  async moverAuditoriasParaFilaQualidade(
    host: Host,
  ): Promise<OrdemServicoListaItem[]> {
    if (host !== Host.MANIA) {
      this.logger.log(`Fila qualidade ignorada — host ${host} não é mania`);
      return [];
    }

    this.logger.log(`Fila qualidade — buscando OS concluídas (${host})`);

    const token = await this.garantirTokenValido(host);
    const dataInicio = formatDateYmd(getMostRecentThursday());
    const dataFim = formatDateYmd(new Date());
    const atendimentoPadrao = atendimentoPadraoPorHost[host];
    const idFilaListaEspera = atendimentoPadrao.id_usuario_responsavel;

    const auditorias =
      await this.hubsoftGetAtendimentosRepository.executeTodasPaginas(
        host,
        {
          pagina: 1,
          itens_por_pagina: 100,
          data_inicio: dataInicio,
          data_fim: dataFim,
          tipo_atendimento: String(atendimentoPadrao.id_tipo_atendimento),
          tipo_data: 'data_cadastro',
        },
        token,
      );

    const auditoriasUnicas = [
      ...new Map<number, HubsoftAtendimento>(
        auditorias.map((auditoria) => [auditoria.id_atendimento, auditoria]),
      ).values(),
    ];

    const detalhes = await Promise.all(
      auditoriasUnicas.map(async (auditoriaLista) => {
        const detalhe = await this.hubsoftGetAtendimentoByIdRepository.execute(
          host,
          auditoriaLista.id_atendimento,
          token,
        );

        return { auditoriaLista, detalhe };
      }),
    );

    const auditoriasPorServico = new Map<number, AuditoriaComercial[]>();
    const auditoriasPorCliente = new Map<number, AuditoriaComercial[]>();

    const adicionar = (
      mapa: Map<number, AuditoriaComercial[]>,
      chave: number,
      item: AuditoriaComercial,
    ) => {
      const existentes = mapa.get(chave) ?? [];
      existentes.push(item);
      mapa.set(chave, existentes);
    };

    for (const { auditoriaLista, detalhe } of detalhes) {
      if (!detalhe) {
        continue;
      }

      const tipo =
        resolverIdTipoAtendimentoDetalhe(detalhe) ??
        toId(auditoriaLista.id_tipo_atendimento);
      const matchTipo =
        tipo == null || tipo === atendimentoPadrao.id_tipo_atendimento;
      const dataCadastro = (
        detalhe.data_cadastro ??
        auditoriaLista.data_cadastro ??
        ''
      ).slice(0, 10);
      const matchData = !dataCadastro || dataCadastro >= dataInicio;
      const idsPivot = idsUsuariosResponsaveis(detalhe.usuarios_responsaveis);
      const matchListaEspera = estaNaListaEspera(
        host,
        idsPivot.map((id) => ({ id })),
        detalhe.id_usuario_responsavel,
      );
      const idClienteServico =
        resolverIdClienteServicoAtendimento(detalhe) ??
        toId(auditoriaLista.servico?.id_cliente_servico);
      const codigoCliente =
        resolverCodigoClienteAtendimento(detalhe) ??
        toId(auditoriaLista.cliente?.codigo_cliente);

      if (!matchTipo || !matchData || !matchListaEspera) {
        continue;
      }

      const item: AuditoriaComercial = { lista: auditoriaLista, detalhe };

      if (idClienteServico) {
        adicionar(auditoriasPorServico, idClienteServico, item);
      }

      if (codigoCliente) {
        adicionar(auditoriasPorCliente, codigoCliente, item);
      }
    }

    const ordens = await this.hubsoftGetOrdensServicoRepository.execute(
      host,
      token,
    );

    const ordensConcluidas = ordens.filter((ordem) =>
      isOsInstalacaoConcluida(ordem),
    );

    const resultado: OrdemServicoListaItem[] = [];

    for (const ordem of ordensConcluidas) {
      const idClienteServico =
        toId(ordem.id_cliente_servico) ??
        toId(ordem.dados_servico?.id_cliente_servico) ??
        toId(ordem.dados_cliente.id_cliente_servico);
      const codigoCliente = toId(ordem.dados_cliente.codigo_cliente);

      const auditoriasDoServico =
        (idClienteServico
          ? auditoriasPorServico.get(idClienteServico)
          : undefined) ??
        (codigoCliente ? auditoriasPorCliente.get(codigoCliente) : undefined);

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

        const usuarioFila = (
          auditoria.detalhe.usuarios_responsaveis ?? []
        ).find(
          (usuario) =>
            usuario.id === idFilaListaEspera ||
            usuario.id_usuario === idFilaListaEspera,
        );

        resultado.push(
          toOrdemServicoListaItem(ordem, host, idServicoItem, {
            idAtendimento: auditoria.detalhe.id_atendimento,
            protocolo:
              auditoria.detalhe.protocolo ?? auditoria.lista.protocolo,
            idTipoAtendimento:
              resolverIdTipoAtendimentoDetalhe(auditoria.detalhe) ??
              atendimentoPadrao.id_tipo_atendimento,
            idAtendimentoStatus:
              auditoria.detalhe.id_atendimento_status ?? null,
            idUsuarioResponsavel:
              auditoria.detalhe.id_usuario_responsavel ?? null,
            idFila:
              usuarioFila?.id ??
              usuarioFila?.id_usuario ??
              idFilaListaEspera,
            nomeFila: usuarioFila?.name ?? 'LISTA DE ESPERA',
            dataCadastro:
              auditoria.detalhe.data_cadastro ??
              auditoria.lista.data_cadastro,
          }),
        );
      }
    }

    const idFilaQualidade = idUsuarioFilaQualidadePorHost[host];
    const idsAtualizados = new Set<number>();
    const idsAtendimento = [
      ...new Set(resultado.map((ordem) => ordem.idAtendimento)),
    ];

    if (idFilaQualidade) {
      const bodyPut = {
        fechar_atendimento: false,
        id_usuario_responsavel: idFilaQualidade,
      };

      for (const idAtendimento of idsAtendimento) {
        const ordemAtualizada = resultado.find(
          (ordem) => ordem.idAtendimento === idAtendimento,
        );

        try {
          await this.hubsoftUpdateAtendimentoRepository.execute(
            host,
            idAtendimento,
            bodyPut,
            token,
          );
          idsAtualizados.add(idAtendimento);
          this.logger.log(
            `Fila qualidade — movido | cliente ${ordemAtualizada?.codigoCliente} | atendimento ${idAtendimento} | protocolo ${ordemAtualizada?.protocolo} | OS ${ordemAtualizada?.numeroOrdemServico} | id_cliente_servico ${ordemAtualizada?.idClienteServico} | id_ordem_servico ${ordemAtualizada?.id} (${host})`,
          );
          await this.hubsoftLogger.filaQualidade({
            action: 'qualidade_atualizado',
            message: `Atendimento ${idAtendimento} movido para FILA QUALIDADE AUDITORIA`,
            host,
            entityId: idAtendimento,
            data: {
              host,
              idAtendimento,
              codigoCliente: ordemAtualizada?.codigoCliente,
              idFila: idFilaQualidade,
              nomeFila: 'FILA QUALIDADE AUDITORIA',
              idUsuarioResponsavel: idFilaQualidade,
            },
          });
        } catch (error) {
          this.logger.error(
            `Fila qualidade — erro | cliente ${ordemAtualizada?.codigoCliente} | atendimento ${idAtendimento} | protocolo ${ordemAtualizada?.protocolo} | OS ${ordemAtualizada?.numeroOrdemServico} (${host}) — ${getErrorMessage(error)}`,
          );
          await this.hubsoftLogger.filaQualidade({
            action: 'qualidade_erro',
            message: `PUT qualidade ERRO idAtendimento=${idAtendimento} message=${getErrorMessage(error)}`,
            host,
            entityId: idAtendimento,
            data: {
              host,
              idAtendimento,
              codigoCliente: ordemAtualizada?.codigoCliente,
              motivo: getErrorMessage(error),
            },
          });
        }
      }
    }

    const resultadoAtualizado = resultado.map((ordem) => {
      if (!idsAtualizados.has(ordem.idAtendimento) || !idFilaQualidade) {
        return ordem;
      }

      return {
        ...ordem,
        idFila: idFilaQualidade,
        nomeFila: 'FILA QUALIDADE AUDITORIA',
        idUsuarioResponsavel: idFilaQualidade,
      };
    });

    this.logger.log(
      `Fila qualidade — ${resultado.length} encontrados, ${idsAtualizados.size} atualizados (${host}) | clientes: ${resultado.map((ordem) => ordem.codigoCliente).join(', ') || 'nenhum'} | atendimentos: ${idsAtendimento.join(', ') || 'nenhum'}`,
    );

    return resultadoAtualizado.sort((esquerda, direita) =>
      direita.dataCadastro.localeCompare(esquerda.dataCadastro),
    );
  }

  private logAndRethrow(context: string, error: unknown): never {
    const message = getErrorMessage(error);
    this.logger.error(
      `${context}: ${message}`,
      error instanceof Error ? error.stack : undefined,
    );
    throw error;
  }
}
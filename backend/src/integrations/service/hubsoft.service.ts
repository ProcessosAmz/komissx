import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from 'src/common/enums/host.enum';
import { atendimentoPadraoPorHost } from '@/integrations/constants/hubsoft/atendimetnoPadrao.constants';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { getErrorMessage } from '@/utils/error.utils';
import { HubsoftGetByIdClienteRepository } from '@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository';
import { HubsoftCreateAtendimentoRepository } from '@/integrations/repository/hubsoft/hubsoftCreateAtendimento.repository';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import { RedisService } from '@/integrations/redis/service/index.service';
import {
  resolveOrdemServicoHost,
  isOrdemDeInstalacao,
  claimWebhookTicket,
  releaseWebhookTicket,
} from '@/integrations/service/helper';

type HostTokenState = {
  accessToken: string;
  expiresAt: number;
};

@Injectable()
export class HubsoftService {
  private readonly logger = new Logger(HubsoftService.name);
  private readonly tokens: Partial<Record<Host, HostTokenState>> = {};

  constructor(
    private readonly httpService: HttpService,
    private readonly hubsoftGetByIdClienteRepository: HubsoftGetByIdClienteRepository,
    private readonly hubsoftCreateAtendimentoRepository: HubsoftCreateAtendimentoRepository,
    private readonly hubsoftLogger: HubsoftLogger,
    private readonly redisService: RedisService,
  ) {}

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
    this.logger.log(`Logando no Hubsoft (${host})...`);

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
        this.httpService.post(`${config.url}/oauth/token`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      this.logger.log(`Logado com sucesso no Hubsoft (${host})`);

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

  async buscarVendedores(host: Host): Promise<any> {
    const config = getHubsoftConfig(host);
    const token = await this.garantirTokenValido(host);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${config.url}/rota/para/buscar/vendedores`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.logAndRethrow('Erro ao buscar vendedores', error);
    }
  }

  async createTicket(payload: OrdemServicoWebhook): Promise<any | null> {
    const numeroOrdem = payload.body.numero_ordem_servico;
    const host = resolveOrdemServicoHost(numeroOrdem);

    if (!host) {
      await this.hubsoftLogger.createTicket({
        action: 'host_invalido',
        message: `Prefixo desconhecido em numero_ordem_servico: ${numeroOrdem.slice(0, 4)}`,
        host: null,
        isInstalacao: false,
        payload: payload.body,
      });
      return null;
    }

    if (host !== Host.MANIA) {
      await this.hubsoftLogger.createTicket({
        action: 'host_ignorado',
        message: `Host ${host} ignorado — validando apenas Mania por enquanto`,
        host,
        isInstalacao: false,
        payload: payload.body,
      });
      return null;
    }

    const instalacao = isOrdemDeInstalacao(
      host,
      payload.body.id_tipo_ordem_servico,
    );

    if (!instalacao) {
      await this.hubsoftLogger.createTicket({
        action: 'tipo_ignorado',
        message: `Tipo de ordem ${payload.body.id_tipo_ordem_servico} não é instalação para o host ${host}`,
        host,
        isInstalacao: false,
        payload: payload.body,
      });
      return null;
    }

    const ordemServicoId = payload.body.id_ordem_servico;
    const claimed = await claimWebhookTicket(
      this.redisService,
      host,
      ordemServicoId,
    );

    if (!claimed) {
      await this.hubsoftLogger.createTicket({
        action: 'duplicado_ignorado',
        message: `Webhook já processado para host=${host} ordem=${ordemServicoId}`,
        host,
        isInstalacao: instalacao,
        payload: payload.body,
      });
      return {
        message: 'Webhook já processado',
        duplicate: true,
      };
    }

    try {
      const token = await this.garantirTokenValido(host);
      const atendimentoPadrao = atendimentoPadraoPorHost[host];

      await this.hubsoftLogger.createTicket({
        action: 'buscar_cliente',
        message: 'Ordem de instalação válida. Buscando cliente...',
        host,
        isInstalacao: instalacao,
        payload: payload.body,
      });

      const cliente = await this.hubsoftGetByIdClienteRepository.execute(
        host,
        payload.body.id_cliente_servico,
        token,
      );

      if (!cliente) {
        await releaseWebhookTicket(this.redisService, host, ordemServicoId);
        await this.hubsoftLogger.createTicket({
          action: 'cliente_nao_encontrado',
          message: `Cliente não encontrado para id_cliente_servico=${payload.body.id_cliente_servico}`,
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

      await this.hubsoftLogger.createTicket({
        action: 'cliente_encontrado',
        message: `Cliente encontrado: ${nome} | ${telefone} | ${email}`,
        host,
        isInstalacao: instalacao,
        payload: payload.body,
        cliente,
      });

      const requestBody = {
        id_cliente_servico: payload.body.id_cliente_servico,
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
        `Atendimento criado com sucesso codigo_cliente: ${atendimento.cliente.codigo_cliente}, Host: ${host}`,
      );

      return {
        message: 'Atendimento criado com sucesso',
      };
    } catch (error) {
      await releaseWebhookTicket(this.redisService, host, ordemServicoId);
      this.logger.error(
        `Erro ao criar atendimento no Hubsoft: ${getErrorMessage(error)}`,
      );
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

  private logAndRethrow(context: string, error: unknown): never {
    const message = getErrorMessage(error);
    this.logger.error(
      `${context}: ${message}`,
      error instanceof Error ? error.stack : undefined,
    );
    throw error;
  }
}
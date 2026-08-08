import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from 'src/common/enums/host.enum';
import { OrdemServicoTipoId } from 'src/common/enums/OrdemServicoStatus.enum';
import { atendimentoPadraoPorHost } from '@/integrations/constants/hubsoft/atendimetnoPadrao.constants';
import {
  OrdemServicoHostPrefixo,
  OrdemServicoHostPrefixoKey,
} from 'src/common/enums/OrdemServicoHostPrefix.type';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { getErrorMessage } from '@/utils/error.utils';
import { HubsoftGetByIdClienteRepository } from '@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository';
import { HubsoftCreateAtendimentoRepository } from '@/integrations/repository/hubsoft/hubsoftCreateAtendimento.repository';

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
    const host = this.resolverHost(numeroOrdem);

    if (!host) {
      this.logger.warn(
        `Prefixo desconhecido em numero_ordem_servico: ${numeroOrdem.slice(0, 4)}`,
      );
      return null;
    }

    if (host !== Host.MANIA) {
      this.logger.warn(
        `Host ${host} ignorado — validando apenas Mania por enquanto`,
      );
      return null;
    }

    const isInstalacao = this.isOrdemDeInstalacao(
      host,
      payload.body.id_tipo_ordem_servico,
    );

    if (!isInstalacao) {
      this.logger.warn(
        `Tipo de ordem ${payload.body.id_tipo_ordem_servico} não é instalação para o host ${host}.`,
      );
      return null;
    }

    try {
      const token = await this.garantirTokenValido(host);
      const atendimentoPadrao = atendimentoPadraoPorHost[host];

      this.logger.log('Ordem de instalação válida. Buscando cliente...');

      const cliente = await this.hubsoftGetByIdClienteRepository.execute(
        host,
        payload.body.id_cliente_servico,
        token,
      );

      if (!cliente) {
        this.logger.warn(
          `Cliente não encontrado para id_cliente_servico=${payload.body.id_cliente_servico}`,
        );
        return null;
      }

      const nome = cliente.nome;
      const telefone = cliente.telefone;
      const email = cliente.email;

      this.logger.log(`cliente encontrado: ${nome} | ${telefone} | ${email}`);
      this.logger.log('Criando atendimento...');

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

      this.logger.log(`Atendimento criado com sucesso codigo_cliente: ${atendimento.cliente.codigo_cliente}`);

      return {
        message: 'Atendimento criado com sucesso',
      };
    } catch (error) {
      this.logAndRethrow('Erro ao criar atendimento no Hubsoft', error);
    }
  }

  private resolverHost(numeroOrdemServico: string): Host | null {
    if (!numeroOrdemServico || numeroOrdemServico.length < 4) {
      return null;
    }

    const prefixo = numeroOrdemServico.slice(0, 4);

    if (!(prefixo in OrdemServicoHostPrefixo)) {
      return null;
    }

    return OrdemServicoHostPrefixo[prefixo as OrdemServicoHostPrefixoKey];
  }

  private isOrdemDeInstalacao(host: Host, idTipo: number): boolean {
    return (OrdemServicoTipoId[host].INSTALACAO as readonly number[]).includes(
      idTipo,
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
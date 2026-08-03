import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { Host } from "src/common/enums/host.enum";
import { OrdemServicoTipoId } from "src/common/enums/OrdemServicoStatus.enum";
import {
  OrdemServicoHostPrefixo,
  OrdemServicoHostPrefixoKey,
} from "src/common/enums/OrdemServicoHostPrefix.type";
import {
  getHubsoftConfig,
  HubsoftConfig,
} from "../constants/hubsoft/hubsoftConfig.constants";
import { OrdemServicoWebhook } from "../type/OrdemServicoWebhook.type";

type HostTokenState = {
  accessToken: string;
  expiresAt: number;
};

@Injectable()
export class HubsoftService {
  private readonly logger = new Logger(HubsoftService.name);
  private readonly tokens: Partial<Record<Host, HostTokenState>> = {};

  constructor(private readonly httpService: HttpService) { }

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
      params.append("client_id", config.clientId);
      params.append("client_secret", config.clientSecret); 
      params.append("grant_type", config.grantType);
      params.append("username", config.username);
      params.append("password", config.password);

      const response = await firstValueFrom(
        this.httpService.post(`${config.url}/oauth/token`, params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
      this.logger.error(`Erro ao logar no Hubsoft (${host})`, error);
      throw error;
    }
  }

  async buscarVendedores(host: Host): Promise<AxiosResponse<any>> {
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
      this.logger.error("Erro ao buscar vendedores", error);
      throw error;
    }
  }

  async createTicket(payload: OrdemServicoWebhook): Promise<any | null> {
    this.logger.log("========== BODY ==========");
    this.logger.log(payload.body);

    const descricao = payload.body.descricao_abertura;
    const numeroOrdem = payload.body.numero_ordem_servico;
    const host = this.resolverHost(numeroOrdem);

    this.logger.log("========== VALIDAÇÃO DA ORDEM ==========");
    this.logger.log("Número OS:", numeroOrdem);
    this.logger.log("Host:", host);
    this.logger.log("Descrição:", descricao);

    if (!host) {
      this.logger.warn(
        `Prefixo desconhecido em numero_ordem_servico: ${numeroOrdem.slice(0, 4)}`,
      );
      return null;
    }

    const isInstalacao = this.isOrdemDeInstalacao(
      host,
      payload.body.id_tipo_ordem_servico,
    );

    this.logger.log("É instalação?", isInstalacao);

    if (!isInstalacao) {
      this.logger.warn(
        `Tipo de ordem ${payload.body.id_tipo_ordem_servico} não é instalação para o host ${host}.`,
      );
      return null;
    }

    const config = getHubsoftConfig(host);
    const token = await this.garantirTokenValido(host);

    this.logger.log("✅ Ordem de instalação válida. Criando atendimento...");

    try {
      return {
        message: "Ticket created successfully",
        data: {
          host,
          name_description: descricao,
          hubUrl: config.url,
        },
      };
    } catch (error: any) {
      this.logger.error(
        "Erro ao criar atendimento no Hubsoft",
        error.response?.data || error.message,
      );
      throw error;
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
}
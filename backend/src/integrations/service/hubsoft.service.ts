import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { Host } from "src/common/enums/host.enum";
import { OrdemServicoTipoId } from "src/common/enums/OrdemServicoStatus.enum";
import {
  OrdemServicoHostPrefixo,
  OrdemServicoHostPrefixoKey,
} from "../type/OrdemServicoHostPrefixo.type";
import { OrdemServicoWebhook } from "../type/OrdemServicoWebhook.type";

@Injectable()
export class HubsoftService {
  private readonly logger = new Logger(HubsoftService.name);

  private accessToken: string | null = null;
  private expiresAt: number | null = null;

  constructor(private readonly httpService: HttpService) {}

  private async garantirTokenValido(): Promise<string> {
    const agora = Date.now();

    if (this.accessToken && this.expiresAt && agora < this.expiresAt) {
      return this.accessToken;
    }

    return this.logarHubsoft();
  }

  private async logarHubsoft(): Promise<string> {
    this.logger.log("Logando no Hubsoft...");
    try {
      const params = new URLSearchParams();
      params.append("client_id", process.env.HUB_CLIENT_ID || "");
      params.append("client_secret", process.env.HUB_CLIENT_SECRET || "");
      params.append("grant_type", process.env.HUB_GRANT_TYPE || "");
      params.append("username", process.env.HUB_USERNAME || "");
      params.append("password", process.env.HUB_PASSWORD || "");

      const response = await firstValueFrom(
        this.httpService.post(`${process.env.HUB_URL}/oauth/token`, params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
      );

      this.logger.log("Logado com sucesso no Hubsoft");

      const token = response.data.access_token;
      this.accessToken = token;
      this.expiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

      return token;
    } catch (error) {
      this.logger.error("Erro ao logar no Hubsoft", error);
      throw error;
    }
  }

  async buscarVendedores(): Promise<AxiosResponse<any>> {
    const token = await this.garantirTokenValido();

    try {
      const response = await firstValueFrom(
        this.httpService.get("rota/para/buscar/vendedores", {
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
    const token = await this.garantirTokenValido();

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
      this.logger.error(
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
      this.logger.error(
        `Tipo de ordem ${payload.body.id_tipo_ordem_servico} não é instalação para o host ${host}.`,
      );
      return null;
    }

    this.logger.log("✅ Ordem de instalação válida. Criando atendimento...");

    try {
      return {
        message: "Ticket created successfully",
        data: {
          host,
          name_description: descricao,
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
    const prefixo = numeroOrdemServico.slice(0, 4);

    return OrdemServicoHostPrefixo[prefixo as OrdemServicoHostPrefixoKey] ?? null;
  }

  private isOrdemDeInstalacao(host: Host, idTipo: number): boolean {
    return (OrdemServicoTipoId[host].INSTALACAO as readonly number[]).includes(
      idTipo,
    );
  }
}
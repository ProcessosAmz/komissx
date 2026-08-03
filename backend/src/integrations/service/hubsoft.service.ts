import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { OrdemServicoStatus } from "src/common/enums/OrdemServicoStatus.enum";
import { OrdemServicoExclusaoType } from "src/common/enums/OrdemServicoStatusExclusao.enum";
import { normalizeText } from "src/helper/normalizeText.helper";
import { OrdemServicoWebhook } from "../type/OrdemServicoWebhook.type";

@Injectable()
export class HubsoftService {
  private readonly logger = new Logger(HubsoftService.name);

  // 1. Armazena o estado no escopo da classe
  private accessToken: string | null = null;
  private expiresAt: number | null = null;

  constructor(private readonly httpService: HttpService) { }

  // 2. Método privado para garantir que temos um token válido
  private async garantirTokenValido(): Promise<string> {
    const agora = Date.now();

    // Se o token existe e ainda não expirou, reutiliza
    if (this.accessToken && this.expiresAt && agora < this.expiresAt) {
      return this.accessToken;
    }

    // Caso contrário, faz o login para obter um novo
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

      // Mudança para firstValueFrom (substituto do toPromise)
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.HUB_URL}/oauth/token`, params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
      );

      this.logger.log("Logado com sucesso no Hubsoft");

      // Salva os dados na classe
      const token = response.data.access_token;
      this.accessToken = token;
      // Margem de segurança de 60 segundos
      this.expiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

      return token;
    } catch (error) {
      this.logger.error("Erro ao logar no Hubsoft", error);
      throw error;
    }
  }

  // 3. Função de busca adaptada para garantir o token antes de disparar
  async buscarVendedores(): Promise<AxiosResponse<any>> {
    // Aguarda a validação/geração do token
    const token = await this.garantirTokenValido();

    try {
      const response = await firstValueFrom(
        this.httpService.get("rota/para/buscar/vendedores", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data; // Retorna diretamente os dados da API
    } catch (error) {
      this.logger.error("Erro ao buscar vendedores", error);
      throw error;
    }
  }

  async createTicket(payload: OrdemServicoWebhook): Promise<any | null> {
    const token = await this.garantirTokenValido();

    this.logger.log("========== BODY ==========");
    this.logger.log(payload.body)

    const descricao = payload.body.descricao_abertura;

    this.logger.log("========== VALIDAÇÃO DA ORDEM ==========");
    this.logger.log("Descrição:", descricao);

    const isInstalacao = this.isOrdemDeInstalacao(host, payload.body.id_tipo_ordem_servico);
    // const isExcluida = this.isOrdemServicoExcluida(descricao);

    this.logger.log("É instalação?", isInstalacao);
    // this.logger.log("É uma ordem excluída?", isExcluida);

    if (!isInstalacao) {
      this.logger.error(
        `❌ A descrição NÃO contém "${OrdemServicoStatus.INSTALACAO}".`
      );
    }

    // if (isExcluida) {
    //   this.logger.error("❌ A descrição contém uma palavra de exclusão.")
    // }

    // if (!isInstalacao || isExcluida) {
    //   this.logger.log("🚫 Ordem de serviço ignorada.");
    //   return null;
    // }

    this.logger.log("✅ Ordem de instalação válida. Criando atendimento...");

    try {
      //   const response = await firstValueFrom(
      //     this.httpService.post(
      //       `/api/v1/integracao/atendimento`,
      //       body,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${token}`,
      //           "Content-Type": "application/json",
      //         },
      //       },
      //     ),
      //   );

      return {
        message: "Ticket created successfully",
        data: {
          name_description: descricao,
        }
      };
    } catch (error: any) {
      this.logger.error(
        "Erro ao criar atendimento no Hubsoft",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  private isOrdemDeInstalacao(descricao?: string): boolean {
    if (!descricao) {
      return false;
    }

    const primeiraLinha = normalizeText(descricao)
      .split("\n")[0]
      .trim();

    console.log("Primeira linha:", primeiraLinha);

    return primeiraLinha.startsWith(OrdemServicoStatus.INSTALACAO);
  }

  private isOrdemServicoExcluida(host: Host, idTIpo: number): boolean {
    const OrdemServicoTipoId[host].INSTALACAO.includes(idTipo);

    // return Object.values(OrdemServicoExclusaoType).some((excecao) =>
    //   descricaoNormalizada.includes(excecao),
    // );
  }
}

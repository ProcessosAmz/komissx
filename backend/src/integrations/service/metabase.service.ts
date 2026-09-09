import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import axios from "axios";
import { Agent as HttpsAgent } from "https";
import { Host } from "@/common/enums/host.enum";
import { MetabaseParameter } from "@/common/interfaces/metabaseParameter.interface";
import {
  METABASE_INSTALLATION_FILTERS,
  METABASE_INSTALLATION_FILTERS_MANIA,
} from "@/integrations/constants/metabase/metabase.constants";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import {
  extrairLinhasMetabase,
  toDataFimMetabase,
  toMetabaseJsonUrl,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";
import { getErrorMessage } from "@/utils/error.utils";

const METABASE_TIMEOUT_MS = 120000;
const METABASE_HTTPS_AGENT = new HttpsAgent({
  rejectUnauthorized: false,
});
const METABASE_JSON_AMAZONET =
  "https://amazonet.hubsoft.com.br:8443/api/public/card/3794d645-c188-449b-bc8d-ee7863714238/query/json";
const METABASE_JSON_MANIA =
  "https://mania.hubsoft.com.br:8443/api/public/card/33487c34-da5a-4934-9b45-7b5051e7f382/query/json";

const metabaseClient = axios.create({
  timeout: METABASE_TIMEOUT_MS,
  httpsAgent: METABASE_HTTPS_AGENT,
  proxy: false,
});

export type FonteMetabaseInstalacao = {
  host: Host;
  url: string;
  rows: unknown[];
};

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  private urlDoHost(host: Host): string {
    const padrao =
      host === Host.MANIA ? METABASE_JSON_MANIA : METABASE_JSON_AMAZONET;
    const bruto =
      host === Host.MANIA
        ? process.env.MANIA_CARD_VENDAS ||
          process.env.MANIA_METABASE_INSTALACAO_TECNICO
        : process.env.AMAZONET_CARD_VENDAS ||
          process.env.AMAZONET_METABASE_INSTALACAO_TECNICO ||
          process.env.METABASE_INSTALACAO_TECNICO;
    const url = toMetabaseJsonUrl(bruto || padrao);
    const hostEsperado =
      host === Host.MANIA ? "mania.hubsoft.com.br" : "amazonet.hubsoft.com.br";

    if (!url.toLowerCase().includes(hostEsperado)) {
      this.logger.warn(
        `URL Metabase inválida para ${host} (${url}). Usando ${padrao}`,
      );
      return padrao;
    }

    return url;
  }

  listarFontesInstalacao(empresa?: Host): { host: Host; url: string }[] {
    const amazonet = {
      host: Host.AMAZONET,
      url: this.urlDoHost(Host.AMAZONET),
    };
    const mania = { host: Host.MANIA, url: this.urlDoHost(Host.MANIA) };

    if (empresa === Host.MANIA) {
      return [mania];
    }

    if (empresa === Host.AMAZONET) {
      return [amazonet];
    }

    return [amazonet, mania];
  }

  private montarParametros(
    dto: RelatorioTecnicoDto,
    host: Host,
  ): MetabaseParameter[] {
    const filtros =
      host === Host.MANIA
        ? METABASE_INSTALLATION_FILTERS_MANIA
        : METABASE_INSTALLATION_FILTERS;
    const parametros: MetabaseParameter[] = [];

    for (const [key, value] of Object.entries(dto)) {
      if (!value) continue;

      const config = filtros[key as keyof typeof filtros];

      if (!config) continue;

      const parametro: MetabaseParameter = {
        type: config.type,
        value:
          key === "dataFim" ? toDataFimMetabase(String(value), host) : value,
        target: [config.target, ["template-tag", config.tag]],
      };

      if ("id" in config && config.id) {
        parametro.id = config.id;
      }

      parametros.push(parametro);
    }

    return parametros;
  }

  async vendasTecnico(dto: RelatorioTecnicoDto): Promise<FonteMetabaseInstalacao[]> {
    const fontes = this.listarFontesInstalacao(dto.empresa);
    this.logger.log(
      `Consultando Metabase ${dto.empresa ?? "todas"}: ${fontes
        .map((fonte) => fonte.url)
        .join(", ")}`,
    );

    const resultados = await Promise.all(
      fontes.map(async (fonte) => {
        const parameters = this.montarParametros(dto, fonte.host);
        this.logger.log(
          `Metabase ${fonte.host} parameters=${JSON.stringify(parameters)}`,
        );

        try {
          const response = await metabaseClient.get<unknown>(fonte.url, {
            params: {
              parameters: JSON.stringify(parameters),
            },
          });

          this.logger.log(
            `Metabase ${fonte.host} retornou ${extrairLinhasMetabase(response.data).length} linhas`,
          );

          return {
            host: fonte.host,
            url: fonte.url,
            rows: extrairLinhasMetabase(response.data),
            falhou: false,
          };
        } catch (error) {
          this.logger.error(
            `Erro ao consultar Metabase (${fonte.host}): ${getErrorMessage(error)}`,
            (error as Error)?.stack,
          );

          return {
            host: fonte.host,
            url: fonte.url,
            rows: [] as unknown[],
            falhou: true,
          };
        }
      }),
    );

    if (resultados.length > 0 && resultados.every((fonte) => fonte.falhou)) {
      throw new InternalServerErrorException(
        "Erro ao buscar instalações no Metabase",
      );
    }

    return resultados.map(({ host, url, rows }) => ({ host, url, rows }));
  }
}

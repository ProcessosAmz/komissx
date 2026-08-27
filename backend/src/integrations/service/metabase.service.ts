import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Host } from "@/common/enums/host.enum";
import { MetabaseParameter } from "@/common/interfaces/metabaseParameter.interface";
import { METABASE_INSTALLATION_FILTERS } from "@/integrations/constants/metabase/metabase.constants";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import {
  extrairLinhasMetabase,
  toDataFimExclusivaMetabase,
  toMetabaseJsonUrl,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";
import { getErrorMessage } from "@/utils/error.utils";

const METABASE_TIMEOUT_MS = 120000;
const METABASE_INSTALACAO_AMAZONET_PADRAO =
  "https://amazonet.hubsoft.com.br:8443/api/public/card/3794d645-c188-449b-bc8d-ee7863714238/query/json";

export type FonteMetabaseInstalacao = {
  host: Host;
  url: string;
  rows: unknown[];
};

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(private readonly http: HttpService) {}

  listarFontesInstalacao(): { host: Host; url: string }[] {
    const amazonetUrl = toMetabaseJsonUrl(
      process.env.AMAZONET_METABASE_INSTALACAO_TECNICO ||
        process.env.METABASE_INSTALACAO_TECNICO ||
        METABASE_INSTALACAO_AMAZONET_PADRAO,
    );
    const maniaUrl = toMetabaseJsonUrl(
      process.env.MANIA_METABASE_INSTALACAO_TECNICO || "",
    );

    const fontes: { host: Host; url: string }[] = [
      { host: Host.AMAZONET, url: amazonetUrl },
    ];

    if (maniaUrl && maniaUrl !== amazonetUrl) {
      fontes.push({ host: Host.MANIA, url: maniaUrl });
    }

    return fontes;
  }

  private montarParametros(dto: RelatorioTecnicoDto): MetabaseParameter[] {
    const parametros: MetabaseParameter[] = [];

    for (const [key, value] of Object.entries(dto)) {
      if (!value) continue;

      const config =
        METABASE_INSTALLATION_FILTERS[
          key as keyof typeof METABASE_INSTALLATION_FILTERS
        ];

      if (!config) continue;

      parametros.push({
        type: config.type,
        value:
          key === "dataFim" ? toDataFimExclusivaMetabase(String(value)) : value,
        target: [config.target, ["template-tag", config.tag]],
      });
    }

    return parametros;
  }

  async vendasTecnico(dto: RelatorioTecnicoDto): Promise<FonteMetabaseInstalacao[]> {
    const parameters = this.montarParametros(dto);
    const fontes = this.listarFontesInstalacao();

    const resultados = await Promise.all(
      fontes.map(async (fonte) => {
        try {
          const response = await firstValueFrom(
            this.http.get<unknown>(fonte.url, {
              params: {
                parameters: JSON.stringify(parameters),
              },
              timeout: METABASE_TIMEOUT_MS,
            }),
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

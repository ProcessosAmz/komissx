import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { MetabaseParameter } from "@/common/interfaces/metabaseParameter.interface";
import { METABASE_INSTALLATION_FILTERS } from "@/integrations/constants/metabase/metabase.constants";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import {
  extrairLinhasMetabase,
  toMetabaseJsonUrl,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";
import { getErrorMessage } from "@/utils/error.utils";

const METABASE_TIMEOUT_MS = 120000;
const METABASE_INSTALACAO_TECNICO_PADRAO =
  "https://amazonet.hubsoft.com.br:8443/api/public/card/3794d645-c188-449b-bc8d-ee7863714238/query/json";

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(private readonly http: HttpService) {}

  getInstalacaoTecnicoUrl(): string {
    const url =
      process.env.METABASE_INSTALACAO_TECNICO ||
      METABASE_INSTALACAO_TECNICO_PADRAO;

    return toMetabaseJsonUrl(url);
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
        value,
        target: [config.target, ["template-tag", config.tag]],
      });
    }

    return parametros;
  }

  async vendasTecnico(dto: RelatorioTecnicoDto): Promise<unknown[]> {
    const url = this.getInstalacaoTecnicoUrl();
    const parameters = this.montarParametros(dto);

    try {
      const response = await firstValueFrom(
        this.http.get<unknown>(url, {
          params: {
            parameters: JSON.stringify(parameters),
          },
          timeout: METABASE_TIMEOUT_MS,
        }),
      );

      return extrairLinhasMetabase(response.data);
    } catch (error) {
      this.logger.error(
        `Erro ao consultar Metabase de instalação técnico: ${getErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      throw new InternalServerErrorException(
        "Erro ao buscar instalações no Metabase",
      );
    }
  }
}

import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { MetabaseParameter } from "@/common/interfaces/metabaseParameter.interface";
import { METABASE_INSTALLATION_FILTERS } from "@/integrations/constants/metabase/metabase.constants";

@Injectable()
export class MetaService {
  constructor(private readonly http: HttpService) {}

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
        target: ["variable", ["template-tag", config.tag]],
      });
    }

    return parametros;
  }

  async vendasTecnico(dto: RelatorioTecnicoDto) {
    const parameters = this.montarParametros(dto);

    const response = await firstValueFrom(
      this.http.get<unknown[]>(process.env.METABASE_INSTALACAO_TECNICO!, {
        params: {
          parameters: JSON.stringify(parameters),
        },
        timeout: 120000,
      }),
    );

    const data = response.data ?? [];

    return {
      success: true,
      total: data.length,
      data,
    };
  }
}

import { RELATORIO_TIMEOUT_MS } from "@/const/reports";
import { API } from "@/lib/axios";
import type {
  RelatorioTecnicoParams,
  RelatorioTecnicoResponse,
} from "@/types/reports";

export class ReportsService {
  private static readonly path = "/reports/tecnicos-instalacao";

  static async buscarInstalacaoTecnica(
    params: RelatorioTecnicoParams,
  ): Promise<RelatorioTecnicoResponse> {
    const response = await API.get<RelatorioTecnicoResponse>(this.path, {
      params,
      timeout: RELATORIO_TIMEOUT_MS,
    });

    const payload = response.data;

    return {
      data: payload.data ?? [],
      tecnicos: payload.tecnicos ?? [],
      message: payload.message ?? "",
    };
  }
}

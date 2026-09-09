import { RELATORIO_TIMEOUT_MS } from "@/const/reports";
import { API } from "@/lib/axios";
import type {
  RelatorioTecnicoParams,
  RelatorioTecnicoResponse,
} from "@/types/reports";

export class ReportsService {
  private static readonly path = "/reports/tecnicos-instalacao";
  private static readonly vendasPath = "/reports/vendas-vendedores";

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

  static async buscarVendasVendedores(
    params: RelatorioTecnicoParams,
  ): Promise<RelatorioTecnicoResponse> {
    const response = await API.get<RelatorioTecnicoResponse>(this.vendasPath, {
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

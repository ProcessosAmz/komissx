import { API } from "@/lib/axios";
import type { OrdemServico } from "@/pages/Fechamentos/types";

const RELATORIO_TIMEOUT_MS = 120000;

export type TecnicoFechamento = {
  id: string;
  name: string;
};

export type RelatorioTecnicoParams = {
  dataInicio: string;
  dataFim: string;
  empresa?: "amazonet" | "mania";
  estado?: string;
  cidade?: string;
  tecnico?: string;
};

export class ReportsService {
  private static readonly path = "/reports/tecnicos-instalacao";

  static async buscarInstalacaoTecnica(params: RelatorioTecnicoParams) {
    const response = await API.get(this.path, {
      params,
      timeout: RELATORIO_TIMEOUT_MS,
    });

    return response.data as {
      data: OrdemServico[];
      tecnicos: TecnicoFechamento[];
      message: string;
    };
  }
}

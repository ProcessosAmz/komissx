import { RELATORIO_TIMEOUT_MS } from "@/const/reports";
import { API } from "@/lib/axios";
import type { FiltrosVendasComercial, RelatorioVendasComercial } from "../domain/types";

export const buscarVendasComercial = async (filtros: FiltrosVendasComercial): Promise<RelatorioVendasComercial> => {
  const response = await API.get<RelatorioVendasComercial>("/reports/vendas-comercial", { params: filtros, timeout: RELATORIO_TIMEOUT_MS });
  const payload = response.data;
  return { data: payload.data ?? [], colaboradores: payload.colaboradores ?? [], lider: payload.lider ?? null, message: payload.message ?? "" };
};

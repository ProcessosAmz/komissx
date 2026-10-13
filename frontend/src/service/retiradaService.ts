import { API } from "@/lib/axios";

export type RetiradaRow = {
  id: string;
  numero_ordem_servico: string;
  codigo_cliente: string;
  estado: string;
  cidade: string;
  vendedor: string;
  conta: "amazonet" | "mania";
  encontrado_na_planilha: boolean;
  pago: boolean;
  [key: string]: unknown;
};

export class RetiradaService {
  static async buscar(params: {
    dataInicio: string;
    dataFim: string;
    empresa?: "amazonet" | "mania";
  }): Promise<RetiradaRow[]> {
    const response = await API.get<{ data: RetiradaRow[] }>("/reports/retiradas", { params });
    return response.data.data ?? [];
  }
}

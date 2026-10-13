import { API } from "@/lib/axios";

export type VendaAutonomo = {
  id: string;
  numero_ordem_servico: string;
  codigo_cliente: string;
  vendedor: string;
  status: string;
  financeiro: "PAGO" | "-";
  valor: number;
  cidade: string;
  estado: string;
  conta: "amazonet" | "mania";
  usuario_cadastro: string;
  data_termino_executado: string;
};

export class VendasAutonomosService {
  static async buscar(params: { dataInicio: string; dataFim: string; empresa?: "amazonet" | "mania" }) {
    const response = await API.get<{ data: VendaAutonomo[] }>("/reports/vendas-autonomos", { params });
    return response.data.data ?? [];
  }
}

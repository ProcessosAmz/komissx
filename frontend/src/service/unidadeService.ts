import { API } from "@/lib/axios";
import type { FiltroUsuarios, UnidadeOpcao } from "@/types/filtro";

export class UnidadesService {
  private static readonly path = "/unidades";

  static async findAll(filters?: Pick<FiltroUsuarios, "empresaId" | "estadoId">) {
    const response = await API.get(this.path, { params: filters });
    return response.data as {
      data: UnidadeOpcao[];
      message: string;
    };
  }
}
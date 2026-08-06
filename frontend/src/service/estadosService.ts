import { API } from "@/lib/axios";
import type { EstadoOpcao } from "@/types/filtro";

export class EstadosService {
  private static readonly path = "/estados";

  static async findAll() {
    const response = await API.get(this.path);
    return response.data as {
      data: EstadoOpcao[];
      message: string;
    };
  }
}
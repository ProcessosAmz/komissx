import { API } from "@/lib/axios";
import type { OpcaoFiltroApi } from "@/types/filtro";

export class EmpresasService {
  private static readonly path = "/empresas";

  static async findAll() {
    const response = await API.get(this.path);
    return response.data as {
      data: OpcaoFiltroApi[];
      message: string;
    };
  }
}
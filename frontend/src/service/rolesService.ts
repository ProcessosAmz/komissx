import { API } from "@/lib/axios";
import type { OpcaoFiltroApi } from "@/types/filtro";

export class RolesService {
  private static readonly path = "/roles";

  static async findAll(input?: { search?: string }) {
    const response = await API.get(this.path, { params: input });
    return response.data as {
      data: OpcaoFiltroApi[];
      message: string;
    };
  }
}
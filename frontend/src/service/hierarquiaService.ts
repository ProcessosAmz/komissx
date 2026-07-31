import { API } from "@/lib/axios";
import { FiltroHierarquia, HierarquiaUnidade } from "@/types/hierarquia";

export class HierarquiaService {
  private static readonly path = "/equipe-hierarquia";

  public static async buscarHierarquia(filtro: FiltroHierarquia): Promise<HierarquiaUnidade> {
    const response = await API.get(this.path, { params: filtro });
    return response.data;
  }

  public static async atualizarHierarquia(
    filtro: FiltroHierarquia,
    hierarquia: HierarquiaUnidade
  ): Promise<HierarquiaUnidade> {
    const response = await API.put(this.path, { filtro, hierarquia });
    return response.data;
  }
}
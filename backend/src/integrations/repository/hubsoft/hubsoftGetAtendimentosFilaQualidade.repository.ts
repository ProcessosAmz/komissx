import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Host } from "@/common/enums/host.enum";
import { getHubsoftConfig } from "@/integrations/constants/hubsoft/hubsoftConfig.constants";
import {
  HubsoftAtendimento,
  HubsoftAtendimentoTodosQuery,
} from "@/integrations/types/OrdemServicoWebhook.type";

type HubsoftAtendimentosFilaQualidadeResponse = {
  atendimentos?:
    | HubsoftAtendimento[]
    | {
        data?: HubsoftAtendimento[];
        current_page?: number;
        last_page?: number;
        pagina_atual?: number;
        ultima_pagina?: number;
      };
  paginacao?: {
    pagina_atual?: number;
    ultima_pagina?: number;
    last_page?: number;
    total_registros?: number;
  };
};

const toAtendimentos = (
  raw: HubsoftAtendimentosFilaQualidadeResponse["atendimentos"],
): HubsoftAtendimento[] => {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && Array.isArray(raw.data)) {
    return raw.data;
  }

  return [];
};

const idTipoAtendimento = (atendimento: HubsoftAtendimento): number | null => {
  if (atendimento.id_tipo_atendimento != null) {
    return Number(atendimento.id_tipo_atendimento);
  }

  const tipo = atendimento.tipo_atendimento;
  if (tipo && typeof tipo === "object" && "id_tipo_atendimento" in tipo) {
    return Number(
      (tipo as { id_tipo_atendimento: number }).id_tipo_atendimento,
    );
  }

  return null;
};

const resolverUltimaPagina = (
  data: HubsoftAtendimentosFilaQualidadeResponse,
  paginaAtual: number,
): number => {
  const nested = data.atendimentos;

  if (nested && !Array.isArray(nested)) {
    return Number(nested.ultima_pagina ?? nested.last_page ?? paginaAtual);
  }

  return Number(
    data.paginacao?.ultima_pagina ?? data.paginacao?.last_page ?? paginaAtual,
  );
};

@Injectable()
export class HubsoftGetAtendimentosFilaQualidadeRepository {
  constructor(private readonly httpService: HttpService) {}

  async executeTodasPaginas(
    host: Host,
    query: HubsoftAtendimentoTodosQuery,
    token: string,
  ): Promise<HubsoftAtendimento[]> {
    const { tipo_atendimento, pagina, itens_por_pagina, ...params } = query;
    const coletados: HubsoftAtendimento[] = [];
    const idsVistos = new Set<number>();
    let paginaAtual = pagina;
    let ultimaPagina = pagina;

    do {
      const { atendimentos, ultimaPagina: ultimaDaPagina } =
        await this.buscarPaginaComMeta(
          host,
          {
            ...params,
            tipo_atendimento,
            itens_por_pagina,
            pagina: paginaAtual,
          },
          token,
        );

      ultimaPagina = ultimaDaPagina;

      const novos = atendimentos.filter(
        (atendimento) => !idsVistos.has(atendimento.id_atendimento),
      );

      if (novos.length === 0) {
        break;
      }

      novos.forEach((atendimento) => {
        idsVistos.add(atendimento.id_atendimento);
        coletados.push(atendimento);
      });

      if (atendimentos.length < itens_por_pagina) {
        break;
      }

      paginaAtual += 1;
    } while (paginaAtual <= ultimaPagina);

    return this.filtrarTipo(coletados, tipo_atendimento);
  }

  private filtrarTipo(
    atendimentos: HubsoftAtendimento[],
    tipoAtendimento?: string,
  ): HubsoftAtendimento[] {
    if (!tipoAtendimento) {
      return atendimentos;
    }

    return atendimentos.filter((atendimento) => {
      const tipo = idTipoAtendimento(atendimento);

      if (tipo == null) {
        return false;
      }

      return String(tipo) === String(tipoAtendimento);
    });
  }

  private async buscarPaginaComMeta(
    host: Host,
    params: HubsoftAtendimentoTodosQuery,
    token: string,
  ): Promise<{
    atendimentos: HubsoftAtendimento[];
    ultimaPagina: number;
  }> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error("Token não informado");
    }

    if (!config) {
      throw new Error("Configuração do Hubsoft não encontrada");
    }

    const response = await firstValueFrom(
      this.httpService.get<HubsoftAtendimentosFilaQualidadeResponse>(
        `${config.url}/api/v1/integracao/atendimento/todos`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      ),
    );

    return {
      atendimentos: toAtendimentos(response.data.atendimentos),
      ultimaPagina: resolverUltimaPagina(response.data, params.pagina),
    };
  }
}

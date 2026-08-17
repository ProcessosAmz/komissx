import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import {
  HubsoftAtendimento,
  HubsoftAtendimentoTodosQuery,
} from '@/integrations/types/OrdemServicoWebhook.type';

type HubsoftAtendimentosTodosResponse = {
  atendimentos?:
    | HubsoftAtendimento[]
    | {
        data?: HubsoftAtendimento[];
      };
};

const toAtendimentos = (
  raw: HubsoftAtendimentosTodosResponse['atendimentos'],
): HubsoftAtendimento[] => {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && Array.isArray(raw.data)) {
    return raw.data;
  }

  return [];
};

@Injectable()
export class HubsoftGetAtendimentosCreateTicketRepository {
  private readonly logger = new Logger(
    HubsoftGetAtendimentosCreateTicketRepository.name,
  );

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    query: HubsoftAtendimentoTodosQuery,
    token: string,
  ): Promise<HubsoftAtendimento[]> {
    const config = getHubsoftConfig(host);
    const { itens_por_pagina, ...params } = query;

    if (!token) {
      this.logger.warn('Token não informado');
      throw new Error('Token não informado');
    }

    if (!config) {
      this.logger.warn('Configuração do Hubsoft não encontrada');
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    const response = await firstValueFrom(
      this.httpService.get<HubsoftAtendimentosTodosResponse>(
        `${config.url}/api/v1/integracao/atendimento/paginado/${itens_por_pagina}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      ),
    );

    return toAtendimentos(response.data.atendimentos);
  }
}
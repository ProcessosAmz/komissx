import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import {
  HubsoftAtendimento,
  HubsoftAtendimentoTodosQuery,
  HubsoftAtendimentoTodosResponse,
} from '@/integrations/types/OrdemServicoWebhook.type';

@Injectable()
export class HubsoftGetAtendimentosRepository {
  private readonly logger = new Logger(HubsoftGetAtendimentosRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    query: HubsoftAtendimentoTodosQuery,
    token: string,
  ): Promise<HubsoftAtendimento[]> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error('Token não informado');
    }

    if (!config) {
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    const response = await firstValueFrom(
      this.httpService.get<HubsoftAtendimentoTodosResponse>(
        `${config.url}/api/v1/integracao/atendimento/todos`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: query,
        },
      ),
    );

    return response.data.atendimentos ?? [];
  }
}
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';

export type HubsoftUsuarioResponsavel = {
  id: number;
  name: string;
};

export type HubsoftAtendimentoDetalhe = {
  id_atendimento: number;
  id_cliente_servico?: number;
  id_tipo_atendimento?: number | null;
  id_motivo_fechamento_atendimento?: number | null;
  usuarios_responsaveis: HubsoftUsuarioResponsavel[];
};

type HubsoftAtendimentoByIdResponse = {
  status: string;
  atendimento: HubsoftAtendimentoDetalhe;
};

@Injectable()
export class HubsoftGetAtendimentoByIdRepository {
  private readonly logger = new Logger(HubsoftGetAtendimentoByIdRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    idAtendimento: number,
    token: string,
  ): Promise<HubsoftAtendimentoDetalhe | null> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error('Token não informado');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<HubsoftAtendimentoByIdResponse>(
          `${config.url}/api/v1/integracao/atendimento/${idAtendimento}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );

      return response.data.atendimento ?? null;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar atendimento ${idAtendimento} no Hubsoft: ${error}`,
      );
      throw error;
    }
  }
}
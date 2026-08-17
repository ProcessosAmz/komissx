import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { AtendimentoPadrao } from '@/integrations/constants/hubsoft/atendimentoPadrao.constants';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import { HubsoftAtendimento, HubsoftCriarAtendimentoResponse } from '@/integrations/types/OrdemServicoWebhook.type';

export type CreateAtendimentoBody = AtendimentoPadrao & {
  id_cliente_servico: number;
  id_usuario_abertura: number;
};

@Injectable()
export class HubsoftCreateAtendimentoRepository {
  private readonly logger = new Logger(HubsoftCreateAtendimentoRepository.name);
  constructor(private readonly httpService: HttpService) { }

  async execute(
    host: Host,
    body: CreateAtendimentoBody,
    token: string,
  ): Promise<HubsoftAtendimento> {
    const config = getHubsoftConfig(host);

    if (!body) {
      this.logger.warn('Body não informado');
      throw new Error('Body não informado');
    }
    if (!token) {
      this.logger.warn('Token não informado');
      throw new Error('Token não informado');
    }

    if (!config) {
      this.logger.warn('Configuração do Hubsoft não encontrada');
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<HubsoftCriarAtendimentoResponse>(
          `${config.url}/api/v1/integracao/atendimento`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.status === 'error') {
        this.logger.error(`Erro ao criar atendimento no Hubsoft: ${response.data.errors.join('; ') || response.data.msg}`);
        throw new Error(response.data.errors.join('; ') || response.data.msg);
      }

      return response.data.atendimento;
    } catch (error) {
      this.logger.error(`Erro ao criar atendimento no Hubsoft: ${error}`);
      throw error;
    }
  }
} 
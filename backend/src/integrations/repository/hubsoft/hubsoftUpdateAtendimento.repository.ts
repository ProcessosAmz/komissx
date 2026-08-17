import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';

export type HubsoftEditarAtendimentoBody = {
  fechar_atendimento: boolean;
  id_usuario_responsavel: number;
};

type HubsoftEditarAtendimentoResponse =
  | {
      status: 'success';
      msg: string;
    }
  | {
      status: 'error';
      msg: string;
      errors?: string[];
    };

@Injectable()
export class HubsoftUpdateAtendimentoRepository {
  private readonly logger = new Logger(HubsoftUpdateAtendimentoRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    idAtendimento: number,
    body: HubsoftEditarAtendimentoBody,
    token: string,
  ): Promise<void> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error('Token não informado');
    }

    if (!config) {
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    const url = `${config.url}/api/v1/integracao/atendimento/${idAtendimento}`;

    this.logger.log(
      `[debug-lista] PUT Hubsoft url=${url} body=${JSON.stringify(body)}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.put<HubsoftEditarAtendimentoResponse>(
          url,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        `[debug-lista] PUT Hubsoft HTTP=${response.status} payload=${JSON.stringify(response.data)}`,
      );

      if (response.data.status === 'error') {
        const detalhe = response.data.errors?.join('; ') ?? response.data.msg;
        this.logger.error(
          `Erro ao editar atendimento ${idAtendimento} no Hubsoft: ${detalhe}`,
        );
        throw new Error(detalhe);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `[debug-lista] PUT Hubsoft AxiosError id=${idAtendimento} http=${error.response?.status ?? 'sem_status'} data=${JSON.stringify(error.response?.data ?? null)} message=${error.message}`,
        );
      }

      throw error;
    }
  }
}
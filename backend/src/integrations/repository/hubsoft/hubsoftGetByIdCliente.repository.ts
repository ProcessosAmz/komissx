import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';

export type ClienteServicoContato = {
  nome: string;
  telefone: string;
  email: string;
};

@Injectable()
export class HubsoftGetByIdClienteRepository {
  private readonly logger = new Logger(HubsoftGetByIdClienteRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    idClienteServico: number,
    token: string,
  ): Promise<ClienteServicoContato | null> {
    const config = getHubsoftConfig(host);

    if(!idClienteServico) {
      this.logger.warn('ID do cliente servico não informado');
      return null;
    }

    if(!token) {
      this.logger.warn('Token não informado');
      throw new Error('Token não informado');
    }

    if(!config) {
      this.logger.warn('Configuração do Hubsoft não encontrada');
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    try {
    const response = await firstValueFrom(
      this.httpService.get(`${config.url}/api/v1/integracao/cliente`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          busca: 'id_cliente_servico',
          termo_busca: idClienteServico,
          relacoes: 'endereco_cadastral',
        },
      }),
    );

    const cliente = response.data?.clientes?.[0];

    return {
      nome: cliente.nome_razaosocial,
      telefone: cliente.telefone_primario ?? cliente.telefones?.[0]?.telefone,
      email: cliente.email_primario ?? cliente.emails?.[0]?.email,
    };
  } catch (error) {
    this.logger.error(`Erro ao buscar cliente no Hubsoft: ${error}`);
    throw error;
  }
}
}
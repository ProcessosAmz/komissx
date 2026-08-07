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
export class HubsoftClienteRepository {
  private readonly logger = new Logger(HubsoftClienteRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async getByIdClienteServico(
    host: Host,
    idClienteServico: number,
    token: string,
  ): Promise<ClienteServicoContato | null> {
    const config = getHubsoftConfig(host);

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

    if (!cliente) {
      this.logger.warn(
        `Cliente não encontrado para id_cliente_servico=${idClienteServico}`,
      );
      return null;
    }

    return {
      nome: cliente.nome_razaosocial,
      telefone: cliente.telefone_primario ?? cliente.telefones?.[0]?.telefone,
      email: cliente.email_primario ?? cliente.emails?.[0]?.email,
    };
  }
}
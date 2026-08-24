import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';
import { isOrdemRelevanteParaFilaQualidade } from '@/integrations/service/helper/ordemServicoTipo.helper';
import {
  formatDateYmd,
  getMostRecentThursday,
} from '@/integrations/service/helper/ordemServicoPeriodo.helper';

export type HubsoftOrdemServicoTipo = {
  id_tipo_ordem_servico: number;
  descricao: string;
  destino: string;
};

export type HubsoftOrdemServicoAtendimento = {
  protocolo: string;
  id_atendimento: number;
  id_tipo_atendimento: number;
  tipo_atendimento: string;
  id_status_atendimento: number;
  status_atendimento: string;
};

export type HubsoftOrdemServicoUsuario = {
  id: number;
  name: string;
};

export type HubsoftOrdemServicoMotivoFechamento = {
  id_motivo_fechamento: number;
  descricao: string;
};

export type HubsoftOrdemServicoListaItem = {
  dados_cliente: {
    codigo_cliente: number;
    id_cliente_servico?: number;
  };
  dados_servico?: {
    id_cliente_servico?: number;
  };
  id_ordem_servico: number;
  id_cliente_servico?: number;
  numero: string;
  tipo: string;
  tipo_ordem_servico: HubsoftOrdemServicoTipo;
  data_inicio_programado: string | null;
  data_termino_programado: string | null;
  data_inicio_executado: string | null;
  data_termino_executado: string | null;
  data_cadastro: string;
  descricao_abertura: string;
  descricao_servico: string;
  descricao_fechamento: string | null;
  status: string;
  status_fechamento?: string | null;
  motivo_fechamento?: HubsoftOrdemServicoMotivoFechamento[] | null;
  atendimento: HubsoftOrdemServicoAtendimento;
  usuario_abertura: HubsoftOrdemServicoUsuario | null;
  usuario_fechamento: HubsoftOrdemServicoUsuario | null;
};

export type HubsoftOrdensServicoPaginacao = {
  primeira_pagina: number;
  ultima_pagina: number;
  pagina_atual: number;
  total_registros: number;
};

export type HubsoftOrdensServicoResponse = {
  status: string;
  msg: string;
  paginacao: HubsoftOrdensServicoPaginacao;
  ordens_servico: HubsoftOrdemServicoListaItem[];
};

@Injectable()
export class HubsoftGetOrdensServicoRepository {
  private readonly logger = new Logger(HubsoftGetOrdensServicoRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    token: string,
  ): Promise<HubsoftOrdemServicoListaItem[]> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error('Token não informado');
    }

    if (!config) {
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    const dataInicio = formatDateYmd(getMostRecentThursday());
    const dataFim = formatDateYmd(new Date());
    const ordens: HubsoftOrdemServicoListaItem[] = [];
    let pagina = 0;
    let ultimaPagina = 0;

    do {
      const response = await firstValueFrom(
        this.httpService.get<HubsoftOrdensServicoResponse>(
          `${config.url}/api/v1/integracao/ordem_servico/todos`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              pagina,
              itens_por_pagina: 100,
              data_inicio: dataInicio,
              data_fim: dataFim,
              tipo_data: 'data_termino_executado',
              status: 'finalizado',
            },
          },
        ),
      );

      const ordensRelevantes = (response.data.ordens_servico ?? []).filter((ordem) =>
        isOrdemRelevanteParaFilaQualidade(
          host,
          ordem.tipo_ordem_servico.id_tipo_ordem_servico,
        ),
      );

      ordens.push(...ordensRelevantes);
      ultimaPagina = response.data.paginacao?.ultima_pagina ?? pagina;
      pagina += 1;
    } while (pagina <= ultimaPagina);

    return ordens;
  }
}
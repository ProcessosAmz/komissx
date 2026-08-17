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

const HORAS_POR_JANELA = 2;
const LIMITE_PAGINAS_POR_JANELA = 5;

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

const idTipoAtendimento = (atendimento: HubsoftAtendimento): number | null => {
  if (atendimento.id_tipo_atendimento != null) {
    return Number(atendimento.id_tipo_atendimento);
  }

  const tipo = atendimento.tipo_atendimento;
  if (tipo && typeof tipo === 'object' && 'id_tipo_atendimento' in tipo) {
    return Number(
      (tipo as { id_tipo_atendimento: number }).id_tipo_atendimento,
    );
  }

  return null;
};

const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const listarJanelas = (
  dataInicio: string,
  dataFim: string,
): { inicio: string; fim: string }[] => {
  const janelas: { inicio: string; fim: string }[] = [];
  const cursor = new Date(`${dataInicio}T00:00:00`);
  const limite = new Date(`${dataFim}T23:59:59`);

  while (cursor < limite) {
    const inicio = formatDateTime(cursor);
    const fimJanela = new Date(cursor);
    fimJanela.setHours(fimJanela.getHours() + HORAS_POR_JANELA);

    if (fimJanela > limite) {
      fimJanela.setTime(limite.getTime());
    }

    janelas.push({
      inicio,
      fim: formatDateTime(fimJanela),
    });
    cursor.setTime(fimJanela.getTime());
  }

  return janelas;
};

@Injectable()
export class HubsoftGetAtendimentosRepository {
  private readonly logger = new Logger(HubsoftGetAtendimentosRepository.name);

  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    query: HubsoftAtendimentoTodosQuery,
    token: string,
  ): Promise<HubsoftAtendimento[]> {
    const { itens_por_pagina, tipo_atendimento, ...params } = query;
    const paginaUnica = await this.buscarPagina(
      host,
      itens_por_pagina,
      params,
      token,
    );

    return this.filtrarTipo(paginaUnica, tipo_atendimento);
  }

  async executeTodasPaginas(
    host: Host,
    query: HubsoftAtendimentoTodosQuery,
    token: string,
  ): Promise<HubsoftAtendimento[]> {
    const {
      itens_por_pagina,
      tipo_atendimento,
      pagina,
      data_inicio,
      data_fim,
      ...params
    } = query;
    const coletados: HubsoftAtendimento[] = [];
    const janelas = listarJanelas(data_inicio, data_fim);

    for (const janela of janelas) {
      const idsDaJanela = new Set<number>();
      let paginaAtual = pagina;

      while (paginaAtual <= LIMITE_PAGINAS_POR_JANELA) {
        const { atendimentos } = await this.buscarPaginaComMeta(
          host,
          itens_por_pagina,
          {
            ...params,
            tipo_atendimento,
            data_inicio: janela.inicio,
            data_fim: janela.fim,
            pagina: paginaAtual,
          },
          token,
        );

        const idsNovos = atendimentos.filter(
          (atendimento) => !idsDaJanela.has(atendimento.id_atendimento),
        );

        this.logger.log(
          `[debug-lista] paginado host=${host} janela=${janela.inicio}..${janela.fim} pagina=${paginaAtual} lote=${atendimentos.length} novos=${idsNovos.length}`,
        );

        if (idsNovos.length === 0) {
          break;
        }

        idsNovos.forEach((atendimento) => {
          idsDaJanela.add(atendimento.id_atendimento);
          coletados.push(atendimento);
        });

        if (atendimentos.length < itens_por_pagina) {
          break;
        }

        paginaAtual += 1;
      }
    }

    const filtrados = this.filtrarTipo(coletados, tipo_atendimento);

    this.logger.log(
      `[debug-lista] paginado host=${host} totalBruto=${coletados.length} aposTipo${tipo_atendimento ?? ''}=${filtrados.length} ids=${JSON.stringify(filtrados.map((atendimento) => atendimento.id_atendimento))}`,
    );

    return filtrados;
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

  private async buscarPagina(
    host: Host,
    itensPorPagina: number,
    params: Omit<HubsoftAtendimentoTodosQuery, 'itens_por_pagina'>,
    token: string,
  ): Promise<HubsoftAtendimento[]> {
    const { atendimentos } = await this.buscarPaginaComMeta(
      host,
      itensPorPagina,
      params,
      token,
    );

    return atendimentos;
  }

  private async buscarPaginaComMeta(
    host: Host,
    itensPorPagina: number,
    params: Omit<HubsoftAtendimentoTodosQuery, 'itens_por_pagina'>,
    token: string,
  ): Promise<{
    atendimentos: HubsoftAtendimento[];
    paginacao: HubsoftAtendimentosTodosResponse['paginacao'];
  }> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error('Token não informado');
    }

    if (!config) {
      throw new Error('Configuração do Hubsoft não encontrada');
    }

    const response = await firstValueFrom(
      this.httpService.get<HubsoftAtendimentosTodosResponse>(
        `${config.url}/api/v1/integracao/atendimento/paginado/${itensPorPagina}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      ),
    );

    return {
      atendimentos: toAtendimentos(response.data.atendimentos),
      paginacao: response.data.paginacao,
    };
  }
}
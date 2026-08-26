import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Host } from "@/common/enums/host.enum";
import { getHubsoftConfig } from "@/integrations/constants/hubsoft/hubsoftConfig.constants";
import {
  formatarDataYmdFilaQualidade,
  isOrdemDeInstalacaoFilaQualidade,
  obterQuintaMaisRecenteFilaQualidade,
} from "@/integrations/useCase/helper/filaQualidade.ordem.helper";

export type HubsoftOrdemServicoTipoFilaQualidade = {
  id_tipo_ordem_servico: number;
  descricao: string;
  destino: string;
};

export type HubsoftOrdemServicoAtendimentoFilaQualidade = {
  protocolo: string;
  id_atendimento: number;
  id_tipo_atendimento: number;
  tipo_atendimento: string;
  id_status_atendimento: number;
  status_atendimento: string;
};

export type HubsoftOrdemServicoUsuarioFilaQualidade = {
  id: number;
  name: string;
};

export type HubsoftOrdemServicoMotivoFechamentoFilaQualidade = {
  id_motivo_fechamento: number;
  descricao: string;
};

export type HubsoftOrdemServicoListaItemFilaQualidade = {
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
  tipo_ordem_servico: HubsoftOrdemServicoTipoFilaQualidade;
  data_inicio_programado: string | null;
  data_termino_programado: string | null;
  data_inicio_executado: string | null;
  data_termino_executado: string | null;
  data_cadastro: string;
  data_fechamento?: string | null;
  descricao_abertura: string;
  descricao_servico: string;
  descricao_fechamento: string | null;
  status: string;
  status_fechamento?: string | null;
  motivo_fechamento?: HubsoftOrdemServicoMotivoFechamentoFilaQualidade[] | null;
  atendimento: HubsoftOrdemServicoAtendimentoFilaQualidade;
  usuario_abertura: HubsoftOrdemServicoUsuarioFilaQualidade | null;
  usuario_fechamento: HubsoftOrdemServicoUsuarioFilaQualidade | null;
};

type HubsoftOrdensServicoFilaQualidadePaginacao = {
  primeira_pagina: number;
  ultima_pagina: number;
  pagina_atual: number;
  total_registros: number;
};

type HubsoftOrdensServicoFilaQualidadeResponse = {
  status: string;
  msg: string;
  paginacao: HubsoftOrdensServicoFilaQualidadePaginacao;
  ordens_servico: HubsoftOrdemServicoListaItemFilaQualidade[];
};

@Injectable()
export class HubsoftGetOrdensServicoFilaQualidadeRepository {
  constructor(private readonly httpService: HttpService) {}

  async execute(
    host: Host,
    token: string,
  ): Promise<HubsoftOrdemServicoListaItemFilaQualidade[]> {
    const config = getHubsoftConfig(host);

    if (!token) {
      throw new Error("Token não informado");
    }

    if (!config) {
      throw new Error("Configuração do Hubsoft não encontrada");
    }

    const dataInicio = formatarDataYmdFilaQualidade(
      obterQuintaMaisRecenteFilaQualidade(),
    );
    const dataFim = formatarDataYmdFilaQualidade(new Date());
    const tiposData = ["data_termino_executado", "data_cadastro"] as const;
    const ordensPorId = new Map<
      number,
      HubsoftOrdemServicoListaItemFilaQualidade
    >();

    for (const tipoData of tiposData) {
      let pagina = 0;
      let ultimaPagina = 0;

      do {
        const response = await firstValueFrom(
          this.httpService.get<HubsoftOrdensServicoFilaQualidadeResponse>(
            `${config.url}/api/v1/integracao/ordem_servico/todos`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                pagina,
                itens_por_pagina: 100,
                data_inicio: dataInicio,
                data_fim: dataFim,
                tipo_data: tipoData,
                status: "finalizado",
              },
            },
          ),
        );

        const ordensDeInstalacao = (response.data.ordens_servico ?? []).filter(
          (ordem) =>
            isOrdemDeInstalacaoFilaQualidade(
              host,
              ordem.tipo_ordem_servico.id_tipo_ordem_servico,
            ),
        );

        ordensDeInstalacao.forEach((ordem) => {
          ordensPorId.set(ordem.id_ordem_servico, ordem);
        });
        ultimaPagina = response.data.paginacao?.ultima_pagina ?? pagina;
        pagina += 1;
      } while (pagina <= ultimaPagina);
    }

    return [...ordensPorId.values()];
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Host } from '@/common/enums/host.enum';
import { getHubsoftConfig } from '@/integrations/constants/hubsoft/hubsoftConfig.constants';

export type HubsoftUsuarioResponsavel = {
  id?: number;
  id_usuario?: number;
  name?: string;
};

export type HubsoftAtendimentoDetalhe = {
  id_atendimento: number;
  protocolo?: string;
  id_cliente_servico?: number;
  id_tipo_atendimento?: number | null;
  tipo_atendimento?: unknown;
  id_atendimento_status?: number | null;
  id_motivo_fechamento_atendimento?: number | null;
  id_usuario_responsavel?: number | null;
  usuarios_responsaveis?: HubsoftUsuarioResponsavel[];
  data_cadastro?: string | null;
  data_fechamento?: string | null;
  servico?: {
    id_cliente_servico?: number;
  };
  cliente_servico?: {
    id_cliente_servico?: number;
  };
  cliente?: {
    codigo_cliente?: number;
  };
};

type HubsoftAtendimentoByIdResponse = {
  status: string;
  atendimento: HubsoftAtendimentoDetalhe;
};

const toNumero = (valor: unknown): number | null => {
  if (valor == null || valor === '') {
    return null;
  }

  const numero = Number(valor);

  if (Number.isNaN(numero) || numero <= 0) {
    return null;
  }

  return numero;
};

export const resolverIdClienteServicoAtendimento = (
  auditoria: HubsoftAtendimentoDetalhe,
): number | null =>
  toNumero(auditoria.id_cliente_servico) ??
  toNumero(auditoria.servico?.id_cliente_servico) ??
  toNumero(auditoria.cliente_servico?.id_cliente_servico);

export const resolverIdTipoAtendimentoDetalhe = (
  auditoria: HubsoftAtendimentoDetalhe,
): number | null => {
  const direto = toNumero(auditoria.id_tipo_atendimento);

  if (direto) {
    return direto;
  }

  const tipo = auditoria.tipo_atendimento;

  if (tipo && typeof tipo === 'object' && 'id_tipo_atendimento' in tipo) {
    return toNumero(
      (tipo as { id_tipo_atendimento: number }).id_tipo_atendimento,
    );
  }

  return null;
};

export const resolverCodigoClienteAtendimento = (
  auditoria: HubsoftAtendimentoDetalhe,
): number | null => toNumero(auditoria.cliente?.codigo_cliente);

export const idsUsuariosResponsaveis = (
  usuarios: HubsoftUsuarioResponsavel[] | undefined | null,
): number[] =>
  (usuarios ?? [])
    .map((usuario) => toNumero(usuario.id) ?? toNumero(usuario.id_usuario))
    .filter((id): id is number => id != null);

@Injectable()
export class HubsoftGetAtendimentoByIdRepository {
  private readonly logger = new Logger(
    HubsoftGetAtendimentoByIdRepository.name,
  );

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

      const atendimento = response.data.atendimento ?? null;

      if (atendimento) {
        this.logger.log(
          `[debug-lista] getById host=${host} id=${idAtendimento} keys=${JSON.stringify(Object.keys(atendimento))} tipo=${resolverIdTipoAtendimentoDetalhe(atendimento) ?? 'null'} statusId=${atendimento.id_atendimento_status ?? 'null'} idClienteServico=${resolverIdClienteServicoAtendimento(atendimento) ?? 'null'} codigoCliente=${resolverCodigoClienteAtendimento(atendimento) ?? 'null'} idUsuarioResponsavel=${atendimento.id_usuario_responsavel ?? 'null'} usuarios=${JSON.stringify(idsUsuariosResponsaveis(atendimento.usuarios_responsaveis))} dataCadastro=${atendimento.data_cadastro ?? 'null'}`,
        );
      }

      return atendimento;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar atendimento ${idAtendimento} no Hubsoft: ${error}`,
      );
      throw error;
    }
  }
}
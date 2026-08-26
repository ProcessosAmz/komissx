import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileLoggerService } from '@/module/logger/service/fileLogger.service';
import { Host } from '@/common/enums/host.enum';
import { ClienteServicoContato } from '@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository';
import { HubsoftAtendimento } from '@/integrations/types/OrdemServicoWebhook.type';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { CreateTicketLogData } from '@/integrations/logger/type/createTicket.type';
import { FilaQualidadeLogData } from '@/integrations/logger/type/filaQualidade.type';

const toTextoStatus = (status: HubsoftAtendimento['status']): string => {
  if (typeof status === 'string') {
    return status;
  }

  return status?.descricao ?? '';
};

const toTextoTipo = (
  tipo: HubsoftAtendimento['tipo_atendimento'],
): string => {
  if (typeof tipo === 'string') {
    return tipo;
  }

  return tipo?.descricao ?? '';
};

const toCodigoCliente = (atendimento: HubsoftAtendimento): number =>
  atendimento.cliente?.codigo_cliente ??
  atendimento.cliente_servico?.cliente?.codigo_cliente ??
  0;

const toNomeCliente = (atendimento: HubsoftAtendimento): string =>
  atendimento.cliente?.nome_razaosocial ??
  atendimento.cliente_servico?.cliente?.nome_razaosocial ??
  '';

@Injectable()
export class HubsoftLogger {
  private readonly moduleName = 'hubsoft';
  private readonly logsDirectory = path.join(process.cwd(), 'src', 'integrations', 'logs')

  constructor(private readonly fileLoggerService: FileLoggerService) { }

  createTicket(params: {
    action: string;
    message: string;
    host: Host | null;
    isInstalacao: boolean;
    payload: OrdemServicoWebhook['body'];
    cliente?: ClienteServicoContato | null;
    atendimento?: HubsoftAtendimento | null;
  }) {
    const data: CreateTicketLogData = {
      host: params.host,
      isInstalacao: params.isInstalacao,
      payload: {
        numero_ordem_servico: params.payload.numero_ordem_servico,
        id_ordem_servico: params.payload.id_ordem_servico,
        id_tipo_ordem_servico: params.payload.id_tipo_ordem_servico,
        id_cliente_servico: params.payload.id_cliente_servico,
        id_usuario_abertura: params.payload.id_usuario_abertura,
        id_atendimento: params.payload.id_atendimento,
        status: params.payload.status,
      },
      cliente: params.cliente
        ? {
          nome: params.cliente.nome,
          telefone: params.cliente.telefone,
          email: params.cliente.email,
        }
        : null,
      atendimento: params.atendimento
        ? {
          id_atendimento: params.atendimento.id_atendimento,
          protocolo: params.atendimento.protocolo,
          status: toTextoStatus(params.atendimento.status),
          tipo_atendimento: toTextoTipo(params.atendimento.tipo_atendimento),
          codigo_cliente: toCodigoCliente(params.atendimento),
          nome_cliente: toNomeCliente(params.atendimento),
        }
        : null,
    };

    return this.fileLoggerService.log({
      logsDirectory: this.logsDirectory,
      module: this.moduleName,
      action: params.action,
      entity: 'atendimento',
      entityId: params.atendimento?.id_atendimento,
      message: params.message,
      data,
    });
  }

  filaQualidade(params: {
    action: string;
    message: string;
    host: Host | null;
    entityId?: number;
    data?: FilaQualidadeLogData;
  }) {
    return this.fileLoggerService.log({
      logsDirectory: this.logsDirectory,
      module: this.moduleName,
      action: params.action,
      entity: 'atendimento',
      entityId: params.entityId,
      message: params.message,
      data: params.data ?? { host: params.host },
    });
  }
}
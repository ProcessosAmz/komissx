import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileLoggerService } from '@/module/logger/service/fileLogger.service';
import { Host } from '@/common/enums/host.enum';
import { ClienteServicoContato } from '@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository';
import { HubsoftAtendimento } from '@/integrations/types/OrdemServicoWebhook.type';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { CreateTicketLogData } from '@/integrations/logger/type/createTicket.type';

@Injectable()
export class HubsoftLogger {
  private readonly moduleName = 'hubsoft';
  private readonly logsDirectory = path.join(process.cwd(), 'src', 'integrations', 'logs')

  constructor(private readonly fileLoggerService: FileLoggerService) {}

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
            status: params.atendimento.status,
            tipo_atendimento: params.atendimento.tipo_atendimento,
            codigo_cliente: params.atendimento.cliente.codigo_cliente,
            nome_cliente: params.atendimento.cliente.nome_razaosocial,
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
}
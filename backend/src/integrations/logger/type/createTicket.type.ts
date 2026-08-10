import { Host } from "@/common/enums/host.enum";
import { ClienteServicoContato } from "@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository";

export type CreateTicketLogData = {
    host: Host | null;
    isInstalacao: boolean;
    payload: {
      numero_ordem_servico: string;
      id_ordem_servico: number;
      id_tipo_ordem_servico: number;
      id_cliente_servico: number;
      id_usuario_abertura: number;
      id_atendimento: number;
      status: string;
    };
    cliente: ClienteServicoContato | null;
    atendimento: {
      id_atendimento: number;
      protocolo: string;
      status: string;
      tipo_atendimento: string;
      codigo_cliente: number;
      nome_cliente: string;
    } | null;
  };
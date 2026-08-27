import { Host } from "@/common/enums/host.enum";

export const STATUS_AUDITORIA = [
  "PENDENTE",
  "APROVADO",
  "NC APROVADO",
  "REPROVADO",
] as const;

export type StatusAuditoriaInstalacao = (typeof STATUS_AUDITORIA)[number];

export class TecnicoFechamentoResponseDto {
  id: string;
  name: string;
}

export class OrdemServicoInstalacaoResponseDto {
  id: string;
  codigo_cliente: string;
  numero_ordem_servico: string;
  usuario_fechamento: string;
  usuario_fechamento_limpo: string;
  usuario_abertura: string;
  tipo_ordem_servico: string;
  data_termino_executado: string;
  status_auditoria: StatusAuditoriaInstalacao;
  conta: Host;
  tecnico_id: string | null;
}

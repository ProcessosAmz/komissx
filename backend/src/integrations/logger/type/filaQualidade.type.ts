import { Host } from '@/common/enums/host.enum';

export type FilaQualidadeLogData = {
  host: Host | null;
  idOrdemServico?: number;
  numeroOrdemServico?: string;
  idClienteServico?: number;
  codigoCliente?: number;
  idAtendimento?: number;
  protocolo?: string;
  idTipoAtendimento?: number;
  idFila?: number;
  nomeFila?: string;
  idUsuarioResponsavel?: number | null;
  status?: string;
  statusFechamento?: string;
  motivo?: string;
};
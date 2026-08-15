import { Host } from '@/common/enums/host.enum';
import { HubsoftOrdemServicoListaItem } from '@/integrations/repository/hubsoft/hubsoftGetOrdensServico.repository';

export type OrdemServicoListaItem = {
  id: number;
  idAtendimento: number;
  idClienteServico: number;
  codigoCliente: number;
  numeroOrdemServico: string;
  motivoFechamento: string;
  usuarioFechamento: string;
  usuarioFechamentoLimpo: string;
  tipoOrdemServico: string;
  dataTerminoExecutado: string;
  status: string;
  conta: Host;
};

export function toOrdemServicoListaItem(
  ordem: HubsoftOrdemServicoListaItem,
  host: Host,
  idClienteServico: number,
): OrdemServicoListaItem {
  const usuarioFechamento = ordem.usuario_fechamento?.name ?? '';
  const partesNome = usuarioFechamento.trim().split(/\s+/);
  const usuarioFechamentoLimpo = partesNome[partesNome.length - 1] ?? '';

  return {
    id: ordem.id_ordem_servico,
    idAtendimento: ordem.atendimento.id_atendimento,
    idClienteServico,
    codigoCliente: ordem.dados_cliente.codigo_cliente,
    numeroOrdemServico: ordem.numero,
    motivoFechamento:
      ordem.motivo_fechamento?.[0]?.descricao ?? ordem.status_fechamento ?? '',
    usuarioFechamento,
    usuarioFechamentoLimpo,
    tipoOrdemServico: ordem.tipo_ordem_servico.descricao,
    dataTerminoExecutado: ordem.data_termino_executado ?? '',
    status: ordem.status,
    conta: host,
  };
}
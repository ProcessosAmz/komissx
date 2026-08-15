import { Host } from '@/common/enums/host.enum';
import { HubsoftOrdemServicoListaItem } from '@/integrations/repository/hubsoft/hubsoftGetOrdensServico.repository';

export type OrdemServicoListaItem = {
  id: number;
  codigoCliente: number;
  numeroOrdemServico: string;
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
): OrdemServicoListaItem {
  const usuarioFechamento = ordem.usuario_fechamento?.name ?? '';
  const partesNome = usuarioFechamento.trim().split(/\s+/);
  const usuarioFechamentoLimpo = partesNome[partesNome.length - 1] ?? '';

  return {
    id: ordem.id_ordem_servico,
    codigoCliente: ordem.dados_cliente.codigo_cliente,
    numeroOrdemServico: ordem.numero,
    usuarioFechamento,
    usuarioFechamentoLimpo,
    tipoOrdemServico: ordem.tipo_ordem_servico.descricao,
    dataTerminoExecutado: ordem.data_termino_executado ?? '',
    status: ordem.status,
    conta: host,
  };
}
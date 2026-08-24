import { Host } from "src/common/enums/host.enum";
import {
  OrdemServicoStatus,
  OrdemServicoTipoId,
} from "src/common/enums/OrdemServicoStatus.enum";

export type CategoriaOrdemServico =
  | typeof OrdemServicoStatus.INSTALACAO
  | typeof OrdemServicoStatus.MUDANCA_ENDERECO
  | typeof OrdemServicoStatus.NAO_CONFORMIDADE;

export function resolverCategoriaOrdemServico(
  host: Host,
  idTipo: number,
): CategoriaOrdemServico | null {
  const tipos = OrdemServicoTipoId[host];

  if ((tipos.INSTALACAO as readonly number[]).includes(idTipo)) {
    return OrdemServicoStatus.INSTALACAO;
  }

  if ((tipos.MUDANCA_ENDERECO as readonly number[]).includes(idTipo)) {
    return OrdemServicoStatus.MUDANCA_ENDERECO;
  }

  if ((tipos.NAO_CONFORMIDADE as readonly number[]).includes(idTipo)) {
    return OrdemServicoStatus.NAO_CONFORMIDADE;
  }

  return null;
}

export function isOrdemDeInstalacao(host: Host, idTipo: number): boolean {
  return resolverCategoriaOrdemServico(host, idTipo) === OrdemServicoStatus.INSTALACAO;
}

export function isOrdemRelevanteParaFilaQualidade(
  host: Host,
  idTipo: number,
): boolean {
  return resolverCategoriaOrdemServico(host, idTipo) != null;
}
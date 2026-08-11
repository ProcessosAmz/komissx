import { Host } from 'src/common/enums/host.enum';
import {
  OrdemServicoHostPrefixo,
  OrdemServicoHostPrefixoKey,
} from 'src/common/enums/OrdemServicoHostPrefix.type';

export function resolveOrdemServicoHost(
  numeroOrdemServico: string,
): Host | null {
  if (!numeroOrdemServico || numeroOrdemServico.length < 4) {
    return null;
  }

  const prefixo = numeroOrdemServico.slice(0, 4);

  if (!(prefixo in OrdemServicoHostPrefixo)) {
    return null;
  }

  return OrdemServicoHostPrefixo[prefixo as OrdemServicoHostPrefixoKey];
}
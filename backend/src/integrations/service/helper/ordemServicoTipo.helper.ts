import { Host } from "src/common/enums/host.enum";
import { OrdemServicoTipoId } from "src/common/enums/OrdemServicoStatus.enum";

export function isOrdemDeInstalacao(host: Host, idTipo: number): boolean {
  return (OrdemServicoTipoId[host].INSTALACAO as readonly number[]).includes(
    idTipo,
  );
}

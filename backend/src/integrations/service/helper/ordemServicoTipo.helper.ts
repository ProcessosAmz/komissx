import { Host } from 'src/common/enums/host.enum';
import { OrdemServicoTipoId } from 'src/common/enums/OrdemServicoStatus.enum';

const normalizar = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function isOrdemDeInstalacao(host: Host, idTipo: number): boolean {
  return (OrdemServicoTipoId[host].INSTALACAO as readonly number[]).includes(
    idTipo,
  );
}

export type OrdemComTipoDesistencia = {
  tipo?: string;
  tipo_ordem_servico?: {
    id_tipo_ordem_servico?: number;
    descricao?: string;
  };
  atendimento?: {
    tipo_atendimento?: string;
    id_tipo_atendimento?: number;
  };
};

export function isOsDesistenciaComAtendimentoInstalacao(
  ordem: OrdemComTipoDesistencia,
): boolean {
  const tipoOs = normalizar(
    ordem.tipo_ordem_servico?.descricao ?? ordem.tipo ?? '',
  );
  const tipoAtendimento = normalizar(
    String(ordem.atendimento?.tipo_atendimento ?? ''),
  );

  if (!tipoOs.includes('desist')) {
    return false;
  }

  if (!tipoAtendimento) {
    return true;
  }

  return tipoAtendimento.includes('instal');
}
import { Host } from '@/common/enums/host.enum';
import { OrdemServicoStatus } from '@/common/enums/OrdemServicoStatus.enum';
import { HubsoftOrdemServicoListaItemFilaQualidade } from '@/integrations/repository/hubsoft/hubsoftGetOrdensServicoFilaQualidade.repository';
import { CategoriaOrdemServicoFilaQualidade } from '@/integrations/useCase/helper/filaQualidade.ordem.helper';
import { HubsoftAtendimento } from '@/integrations/types/OrdemServicoWebhook.type';

export type AuditoriaListaEspera = {
  idAtendimento: number;
  protocolo: string;
  idTipoAtendimento: number;
  idAtendimentoStatus: number | null;
  idUsuarioResponsavel: number | null;
  idUsuarioAbertura: number | null;
  usuarioAbertura: string;
  idFila: number;
  nomeFila: string;
  dataCadastro: string;
  categoriaOrdemServico: CategoriaOrdemServicoFilaQualidade;
  idTipoOrdemServico: number;
};

export type OrdemServicoListaItem = {
  id: number | null;
  idAtendimento: number | null;
  idClienteServico: number;
  codigoCliente: number;
  numeroOrdemServico: string;
  motivoFechamento: string;
  usuarioAbertura: string;
  idUsuarioAbertura: number | null;
  usuarioFechamento: string;
  usuarioFechamentoLimpo: string;
  tipoOrdemServico: string;
  idTipoOrdemServico: number;
  categoriaOrdemServico: CategoriaOrdemServicoFilaQualidade;
  dataTerminoExecutado: string;
  status: string;
  statusFechamento: string;
  protocolo: string | null;
  idTipoAtendimento: number | null;
  idAtendimentoStatus: number | null;
  idUsuarioResponsavel: number | null;
  idFila: number | null;
  nomeFila: string | null;
  dataCadastro: string;
  conta: Host;
};

export const resolverUsuarioAbertura = (
  usuario: HubsoftAtendimento['usuario_abertura'] | undefined,
  idUsuarioAbertura?: number | null,
): { id: number | null; nome: string; origem: string } => {
  const idCampoDireto =
    Number(idUsuarioAbertura) > 0 ? Number(idUsuarioAbertura) : null;

  if (usuario && typeof usuario === 'object') {
    const idDoObjeto = Number(usuario.id);

    if (idDoObjeto > 0) {
      return {
        id: idDoObjeto,
        nome: usuario.name ?? '',
        origem: 'usuario_abertura.id',
      };
    }

    if (idCampoDireto) {
      return {
        id: idCampoDireto,
        nome: usuario.name ?? '',
        origem: 'id_usuario_abertura',
      };
    }

    return {
      id: null,
      nome: usuario.name ?? '',
      origem: 'usuario_abertura.nome',
    };
  }

  if (idCampoDireto) {
    return {
      id: idCampoDireto,
      nome: typeof usuario === 'string' ? usuario : '',
      origem: 'id_usuario_abertura',
    };
  }

  return {
    id: null,
    nome: typeof usuario === 'string' ? usuario : '',
    origem: 'usuario_abertura.nome',
  };
};

export function toOrdemServicoListaItem(
  ordem: HubsoftOrdemServicoListaItemFilaQualidade,
  host: Host,
  idClienteServico: number,
  auditoria: AuditoriaListaEspera | null,
  categoria: CategoriaOrdemServicoFilaQualidade,
): OrdemServicoListaItem {
  const usuarioFechamento = ordem.usuario_fechamento?.name ?? '';
  const partesNome = usuarioFechamento.trim().split(/\s+/);
  const usuarioFechamentoLimpo = partesNome[partesNome.length - 1] ?? '';

  return {
    id: ordem.id_ordem_servico,
    idAtendimento: auditoria?.idAtendimento ?? null,
    idClienteServico,
    codigoCliente: ordem.dados_cliente.codigo_cliente,
    numeroOrdemServico: ordem.numero,
    motivoFechamento:
      ordem.motivo_fechamento?.[0]?.descricao ?? ordem.status_fechamento ?? '',
    usuarioAbertura:
      auditoria?.usuarioAbertura || ordem.usuario_abertura?.name || '',
    idUsuarioAbertura:
      auditoria?.idUsuarioAbertura ?? ordem.usuario_abertura?.id ?? null,
    usuarioFechamento,
    usuarioFechamentoLimpo,
    tipoOrdemServico: ordem.tipo_ordem_servico.descricao,
    idTipoOrdemServico:
      auditoria?.idTipoOrdemServico ??
      ordem.tipo_ordem_servico.id_tipo_ordem_servico,
    categoriaOrdemServico: auditoria?.categoriaOrdemServico ?? categoria,
    dataTerminoExecutado: ordem.data_termino_executado ?? '',
    status: ordem.status,
    statusFechamento: ordem.status_fechamento ?? '',
    protocolo: auditoria?.protocolo ?? null,
    idTipoAtendimento: auditoria?.idTipoAtendimento ?? null,
    idAtendimentoStatus: auditoria?.idAtendimentoStatus ?? null,
    idUsuarioResponsavel: auditoria?.idUsuarioResponsavel ?? null,
    idFila: auditoria?.idFila ?? null,
    nomeFila: auditoria?.nomeFila ?? null,
    dataCadastro: auditoria?.dataCadastro ?? ordem.data_cadastro,
    conta: host,
  };
}

export function toListaItemFromAuditoria(
  auditoria: HubsoftAtendimento,
  host: Host,
  idTipoAtendimento: number,
  idFilaListaEspera: number,
): OrdemServicoListaItem {
  const abertura = resolverUsuarioAbertura(
    auditoria.usuario_abertura,
    auditoria.id_usuario_abertura,
  );
  const usuarioFila = (auditoria.usuarios_responsaveis ?? []).find(
    (usuario) => usuario.id === idFilaListaEspera,
  );
  const idClienteServico = Number(auditoria.servico?.id_cliente_servico) || 0;

  return {
    id: null,
    idAtendimento: auditoria.id_atendimento,
    idClienteServico,
    codigoCliente: auditoria.cliente?.codigo_cliente ?? 0,
    numeroOrdemServico: '',
    motivoFechamento: '',
    usuarioAbertura: abertura.nome,
    idUsuarioAbertura: abertura.id,
    usuarioFechamento: '',
    usuarioFechamentoLimpo: '',
    tipoOrdemServico: '',
    idTipoOrdemServico: 0,
    categoriaOrdemServico: OrdemServicoStatus.INSTALACAO,
    dataTerminoExecutado: '',
    status:
      typeof auditoria.status === 'string'
        ? auditoria.status
        : String(
            (auditoria.status as { descricao?: string } | undefined)
              ?.descricao ?? '',
          ),
    statusFechamento: auditoria.status_fechamento ?? '',
    protocolo: auditoria.protocolo,
    idTipoAtendimento: auditoria.id_tipo_atendimento ?? idTipoAtendimento,
    idAtendimentoStatus: auditoria.id_atendimento_status ?? null,
    idUsuarioResponsavel: auditoria.id_usuario_responsavel ?? null,
    idFila: usuarioFila?.id ?? idFilaListaEspera,
    nomeFila: usuarioFila?.name ?? 'LISTA DE ESPERA',
    dataCadastro: auditoria.data_cadastro,
    conta: host,
  };
}

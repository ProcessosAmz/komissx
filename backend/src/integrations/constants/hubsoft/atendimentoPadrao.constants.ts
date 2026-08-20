import { Host } from "@/common/enums/host.enum";

export type AtendimentoPadrao = {
  id_tipo_atendimento: number;
  id_atendimento_status: number;
  descricao: string;
  nome: string;
  telefone: string;
  email: string;
  id_usuario_responsavel: number;
};

export const atendimentoPadraoPorHost: Record<Host, AtendimentoPadrao> = {
  [Host.AMAZONET]: {
    id_tipo_atendimento: 314,
    id_atendimento_status: 2,
    descricao: "Atendimento aberto automaticamente para auditoria de venda",
    nome: "Processos",
    telefone: "93928450524",
    email: "marketingpa@amazonett.com.br",
    id_usuario_responsavel: 2503,
  },
  [Host.MANIA]: {
    id_tipo_atendimento: 475,
    id_atendimento_status: 12,
    descricao: "Atendimento aberto automaticamente para auditoria de venda",
    nome: "Processos Api",
    telefone: "93928450524",
    email: "processos@amazonett.com.br",
    id_usuario_responsavel: 787,
  },
};

export const idUsuarioFilaQualidadePorHost: Partial<Record<Host, number>> = {
  [Host.AMAZONET]: 2243,
  [Host.MANIA]: 1417,
};

export const idUsuarioListaEsperaPorHost: Partial<Record<Host, number>> = {
  [Host.AMAZONET]: 2503,
  [Host.MANIA]: 787,
};

const usuarioEstaNaFila = (
  idFila: number | undefined,
  usuarios: { id: number }[] | undefined | null,
  idUsuarioResponsavel?: number | null,
): boolean => {
  if (!idFila) {
    return false;
  }

  if (idUsuarioResponsavel === idFila) {
    return true;
  }

  return (usuarios ?? []).some((usuario) => usuario.id === idFila);
};

export const estaNaListaEspera = (
  host: Host,
  usuarios: { id: number }[] | undefined | null,
  idUsuarioResponsavel?: number | null,
): boolean =>
  usuarioEstaNaFila(
    idUsuarioListaEsperaPorHost[host],
    usuarios,
    idUsuarioResponsavel,
  );

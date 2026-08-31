import { isAxiosError } from "axios";
import type { TecnicoFechamento } from "@/types/reports";
import {
  LABEL_TECNICO_PADRAO,
  LABEL_TODOS_TECNICOS,
  LISTAGEM_AUTO,
  MENSAGEM_ERRO_CARREGAMENTO,
  TECNICO_TODOS,
} from "@/pages/Fechamentos/semanal/tecnicos/constants";
import {
  formatarDataBr,
  somarDias,
} from "@/pages/Fechamentos/semanal/tecnicos/services/periodoFechamento.helper";
import type {
  ContagemListagemTecnicos,
  EmpresaFechamento,
  FiltroListagemTecnicos,
  ListagemNaUrl,
} from "@/types/tecnicos";
import type {
  ResumoFechamentoDTO,
  TecnicoRowViewModel,
} from "@/pages/Fechamentos/types";
import { ordemCorrespondeABusca } from "@/pages/Fechamentos/semanal/tecnicos/services/buscaOrdem";

type RelatorioErroBody = {
  message?: string | string[];
};

interface TotaisResumo {
  totalReceber: number;
  totalOS: number;
  aprovadas: number;
  reprovadas: number;
}

export const obterMensagemErro = (error: unknown): string => {
  if (!isAxiosError<RelatorioErroBody>(error)) {
    return MENSAGEM_ERRO_CARREGAMENTO;
  }

  const mensagem = error.response?.data?.message;

  if (typeof mensagem === "string" && mensagem.length > 0) {
    return mensagem;
  }

  if (Array.isArray(mensagem)) {
    const texto = mensagem
      .filter((item): item is string => typeof item === "string")
      .join(" ");

    if (texto.length > 0) {
      return texto;
    }
  }

  return MENSAGEM_ERRO_CARREGAMENTO;
};

export const deduplicarTecnicos = (
  tecnicos: TecnicoFechamento[],
): TecnicoFechamento[] => {
  return Array.from(
    new Map(tecnicos.map((tecnico) => [tecnico.id, tecnico])).values(),
  );
};

export const nomeSemAcento = (nome: string): string => {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const montarListaTecnicos = (
  tecnicosCadastro: TecnicoFechamento[],
): TecnicoFechamento[] => {
  return [{ id: TECNICO_TODOS, name: LABEL_TODOS_TECNICOS }, ...tecnicosCadastro];
};

export const filtrarDadosBase = (params: {
  dados: TecnicoRowViewModel[];
  listaTecnicos: TecnicoFechamento[];
  filtroTecnico: string;
  filtroEmpresa: EmpresaFechamento;
  buscaOS: string;
}): TecnicoRowViewModel[] => {
  const tecnicoSelecionado = params.listaTecnicos.find(
    (tecnico) => tecnico.id === params.filtroTecnico,
  );
  const nomeTecnico = tecnicoSelecionado?.name ?? "";
  const filtrandoLiderLobatos =
    params.filtroTecnico !== TECNICO_TODOS &&
    /leidinaldo|lobatos|lobato/i.test(nomeSemAcento(nomeTecnico));

  return params.dados.filter((os) => {
    const matchEmpresa = os.conta === params.filtroEmpresa;
    const matchTecnico =
      params.filtroTecnico === TECNICO_TODOS ||
      os.tecnico_id === params.filtroTecnico ||
      (filtrandoLiderLobatos && /TEC[_\s]LOBATOS/i.test(os.usuario_fechamento));

    return (
      matchEmpresa &&
      matchTecnico &&
      ordemCorrespondeABusca(os, params.buscaOS)
    );
  });
};

export const resolverFiltroListagem = (
  listagemNaUrl: ListagemNaUrl,
  contagemListagem: ContagemListagemTecnicos,
): FiltroListagemTecnicos => {
  if (listagemNaUrl !== LISTAGEM_AUTO) {
    return listagemNaUrl;
  }

  if (contagemListagem.duplicados > 0) {
    return "duplicados";
  }

  return "TODOS";
};

export const montarResumo = (params: {
  dadosBase: TecnicoRowViewModel[];
  listaTecnicos: TecnicoFechamento[];
  filtroTecnico: string;
  dataInicio: string;
  dataFim: string;
}): ResumoFechamentoDTO => {
  const totais = params.dadosBase.reduce<TotaisResumo>(
    (acc, os) => {
      acc.totalOS += 1;
      if (os.status_financeiro === "PAGO") {
        acc.aprovadas += 1;
        acc.totalReceber += os.valor_a_pagar || 0;
      } else {
        acc.reprovadas += 1;
      }
      return acc;
    },
    { totalReceber: 0, totalOS: 0, aprovadas: 0, reprovadas: 0 },
  );

  const tecnicoSelecionado = params.listaTecnicos.find(
    (tecnico) => tecnico.id === params.filtroTecnico,
  );

  return {
    ...totais,
    dataPagamento: somarDias(params.dataFim, 1),
    tecnico:
      params.filtroTecnico === TECNICO_TODOS
        ? LABEL_TODOS_TECNICOS
        : (tecnicoSelecionado?.name ?? LABEL_TECNICO_PADRAO),
    periodo: `${formatarDataBr(params.dataInicio)} a ${formatarDataBr(params.dataFim)}`,
  };
};

import {
  DATA_ISO,
  EMPRESA_PADRAO,
  EMPRESAS_FECHAMENTO,
  FILTRO_LISTAGEM,
  LISTAGEM_AUTO,
  QUERY_TECNICOS,
  TECNICO_TODOS,
} from "@/pages/Fechamentos/semanal/tecnicos/constants";
import type {
  EmpresaFechamento,
  FiltroListagemTecnicos,
  FiltrosUrlTecnicos,
  ListagemNaUrl,
} from "@/types/tecnicos";

export const isDataIso = (valor: string | null): valor is string => {
  return Boolean(valor && DATA_ISO.test(valor));
};

export const isEmpresaFechamento = (
  valor: string,
): valor is EmpresaFechamento => {
  return EMPRESAS_FECHAMENTO.some((empresa) => empresa === valor);
};

export const isFiltroListagem = (
  valor: string,
): valor is FiltroListagemTecnicos => {
  return FILTRO_LISTAGEM.some((filtro) => filtro === valor);
};

export const lerEmpresaDaQuery = (
  valor: string | null,
): EmpresaFechamento => {
  if (valor !== null && isEmpresaFechamento(valor)) {
    return valor;
  }

  return EMPRESA_PADRAO;
};

export const lerListagemDaQuery = (valor: string | null): ListagemNaUrl => {
  if (!valor) {
    return LISTAGEM_AUTO;
  }

  if (valor === "sem-status") {
    return "pendente-auditoria";
  }

  if (isFiltroListagem(valor)) {
    return valor;
  }

  return LISTAGEM_AUTO;
};

export const lerTecnicoDaQuery = (
  valor: string | null,
  idsValidos: string[],
): string => {
  if (!valor || valor === TECNICO_TODOS) {
    return TECNICO_TODOS;
  }

  if (idsValidos.length === 0 || idsValidos.includes(valor)) {
    return valor;
  }

  return TECNICO_TODOS;
};

export const aplicarFiltroNaQuery = (
  atual: URLSearchParams,
  filtros: FiltrosUrlTecnicos,
): URLSearchParams => {
  const proxima = new URLSearchParams(atual);

  proxima.set(QUERY_TECNICOS.dataInicio, filtros.dataInicio);
  proxima.set(QUERY_TECNICOS.dataFim, filtros.dataFim);
  proxima.set(QUERY_TECNICOS.empresa, filtros.empresa);

  if (filtros.tecnico === TECNICO_TODOS) {
    proxima.delete(QUERY_TECNICOS.tecnico);
  } else {
    proxima.set(QUERY_TECNICOS.tecnico, filtros.tecnico);
  }

  const busca = filtros.busca.trim();
  if (busca.length === 0) {
    proxima.delete(QUERY_TECNICOS.busca);
  } else {
    proxima.set(QUERY_TECNICOS.busca, busca);
  }

  if (filtros.listagem === LISTAGEM_AUTO) {
    proxima.delete(QUERY_TECNICOS.listagem);
  } else {
    proxima.set(QUERY_TECNICOS.listagem, filtros.listagem);
  }

  return proxima;
};

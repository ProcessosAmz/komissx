export const QUERY_TECNICOS = {
  dataInicio: "dataInicio",
  dataFim: "dataFim",
  empresa: "empresa",
  tecnico: "tecnico",
  busca: "busca",
} as const;

export const EMPRESA_TODAS = "TODAS";
export const TECNICO_TODOS = "TODOS";

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isDataIso(valor: string | null): valor is string {
  return Boolean(valor && DATA_ISO.test(valor));
}

export function lerEmpresaDaQuery(valor: string | null): string {
  if (valor === "amazonet" || valor === "mania") {
    return valor;
  }

  return EMPRESA_TODAS;
}

export function lerTecnicoDaQuery(
  valor: string | null,
  idsValidos: string[],
): string {
  if (!valor || valor === TECNICO_TODOS) {
    return TECNICO_TODOS;
  }

  if (idsValidos.length === 0 || idsValidos.includes(valor)) {
    return valor;
  }

  return TECNICO_TODOS;
}

export function aplicarFiltroNaQuery(
  atual: URLSearchParams,
  filtros: {
    dataInicio: string;
    dataFim: string;
    empresa: string;
    tecnico: string;
    busca: string;
  },
): URLSearchParams {
  const proxima = new URLSearchParams(atual);

  proxima.set(QUERY_TECNICOS.dataInicio, filtros.dataInicio);
  proxima.set(QUERY_TECNICOS.dataFim, filtros.dataFim);

  if (filtros.empresa === EMPRESA_TODAS) {
    proxima.delete(QUERY_TECNICOS.empresa);
  } else {
    proxima.set(QUERY_TECNICOS.empresa, filtros.empresa);
  }

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

  return proxima;
}

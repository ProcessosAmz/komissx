import type {
  FechamentoSemanalRules,
  OrdemServico,
  TecnicoRowViewModel,
} from "@/pages/Fechamentos/types";
import type {
  ContagemListagemTecnicos,
  FiltroListagemTecnicos,
} from "@/types/tecnicos";

type IdentidadeCliente = {
  codigo_cliente: string;
  numero_ordem_servico: string;
};

export const chaveCliente = (os: IdentidadeCliente): string => {
  return os.codigo_cliente.trim() || os.numero_ordem_servico;
};

export const quantidadePorCliente = (
  dados: IdentidadeCliente[],
): Map<string, number> => {
  const quantidade = new Map<string, number>();

  for (const os of dados) {
    const chave = chaveCliente(os);
    quantidade.set(chave, (quantidade.get(chave) ?? 0) + 1);
  }

  return quantidade;
};

export const calcularValorRepasse = (
  nome: string,
  rules: FechamentoSemanalRules,
): number => {
  const terceirizados = rules.tecnicos_terceirizados;
  if (!terceirizados) {
    return 0;
  }

  const nomeUpper = nome.toUpperCase().trim();
  for (const [chave, valor] of Object.entries(terceirizados)) {
    if (nomeUpper.includes(chave.toUpperCase())) {
      return valor;
    }
  }

  return 0;
};

const isOsPagaNoFechamento = (os: OrdemServico): boolean => {
  return os.status_auditoria.toUpperCase().trim() === "APROVADO";
};

export const processar = (
  dados: OrdemServico[],
  rules: FechamentoSemanalRules,
): TecnicoRowViewModel[] => {
  return dados.map((os) => {
    const isAprovada = isOsPagaNoFechamento(os);
    const statusFin = isAprovada ? "PAGO" : "-";
    const vBase = isAprovada
      ? calcularValorRepasse(
          `${os.usuario_fechamento_limpo} ${os.usuario_fechamento}`,
          rules,
        )
      : 0;

    return {
      ...os,
      status_financeiro: statusFin,
      valor_base: vBase,
      valor_a_pagar: statusFin === "PAGO" ? vBase : 0,
    };
  });
};

export const processarEDeduplicar = (
  dados: OrdemServico[],
  rules: FechamentoSemanalRules,
): TecnicoRowViewModel[] => {
  return processar(dados, rules);
};

export const classificarListagem = (
  os: TecnicoRowViewModel,
  quantidadePorClienteMap: Map<string, number>,
): FiltroListagemTecnicos => {
  if ((quantidadePorClienteMap.get(chaveCliente(os)) ?? 0) > 1) {
    return "duplicados";
  }

  const status = os.status_auditoria.trim().toUpperCase();

  if (os.status_financeiro === "PAGO" && os.valor_a_pagar > 0) {
    return "aprovados";
  }

  if (status === "REPROVADO") {
    return "reprovado";
  }

  return "pendente-auditoria";
};

export const ordenarParaListagem = (
  dados: TecnicoRowViewModel[],
  quantidadePorClienteMap: Map<string, number>,
): TecnicoRowViewModel[] => {
  return [...dados].sort((ordemA, ordemB) => {
    const duplicadoA =
      (quantidadePorClienteMap.get(chaveCliente(ordemA)) ?? 0) > 1 ? 0 : 1;
    const duplicadoB =
      (quantidadePorClienteMap.get(chaveCliente(ordemB)) ?? 0) > 1 ? 0 : 1;
    if (duplicadoA !== duplicadoB) {
      return duplicadoA - duplicadoB;
    }

    const cliente = ordemA.codigo_cliente.localeCompare(ordemB.codigo_cliente);
    if (cliente !== 0) {
      return cliente;
    }

    return ordemA.numero_ordem_servico.localeCompare(
      ordemB.numero_ordem_servico,
    );
  });
};

export const contarListagem = (
  dados: TecnicoRowViewModel[],
  quantidadePorClienteMap: Map<string, number>,
): ContagemListagemTecnicos => {
  const contagem: ContagemListagemTecnicos = {
    TODOS: dados.length,
    duplicados: 0,
    "pendente-auditoria": 0,
    aprovados: 0,
    reprovado: 0,
  };

  for (const os of dados) {
    const grupo = classificarListagem(os, quantidadePorClienteMap);
    if (grupo !== "TODOS") {
      contagem[grupo] += 1;
    }
  }

  return contagem;
};

export const filtrarListagem = (
  dados: TecnicoRowViewModel[],
  filtro: FiltroListagemTecnicos,
  quantidadePorClienteMap: Map<string, number>,
): TecnicoRowViewModel[] => {
  if (filtro === "TODOS") {
    return ordenarParaListagem(dados, quantidadePorClienteMap);
  }

  return ordenarParaListagem(
    dados.filter(
      (os) => classificarListagem(os, quantidadePorClienteMap) === filtro,
    ),
    quantidadePorClienteMap,
  );
};

export const resolverOrdemAtual = (
  ordemSelecionada: TecnicoRowViewModel | null,
  dadosFiltrados: TecnicoRowViewModel[],
  dadosBase: TecnicoRowViewModel[],
): TecnicoRowViewModel | null => {
  if (!ordemSelecionada) {
    return null;
  }

  return (
    dadosFiltrados.find((item) => item.id === ordemSelecionada.id) ??
    dadosBase.find((item) => item.id === ordemSelecionada.id) ??
    ordemSelecionada
  );
};

export const listarClientesDuplicados = (
  dadosBase: TecnicoRowViewModel[],
  quantidadePorClienteMap: Map<string, number>,
): Set<string> => {
  const duplicados = new Set<string>();

  for (const os of dadosBase) {
    const chave = chaveCliente(os);
    if ((quantidadePorClienteMap.get(chave) ?? 0) > 1) {
      duplicados.add(chave);
    }
  }

  return duplicados;
};

export type FaixaQuantidade = [number, number | null, number];

export type ProblemaRegraMensal = {
  severidade: "erro" | "alerta";
  mensagem: string;
};

type FaixaNormalizada = {
  inicio: number;
  fim: number | null;
  valor: number;
};

const numeroFinito = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);

const normalizarFaixa = (faixa: unknown): FaixaNormalizada | null => {
  if (Array.isArray(faixa)) {
    const [inicio, fim, valor] = faixa;
    if (!numeroFinito(inicio) || (!numeroFinito(fim) && fim !== null) || !numeroFinito(valor)) {
      return null;
    }
    return { inicio, fim, valor };
  }

  if (faixa && typeof faixa === "object") {
    const registro = faixa as Record<string, unknown>;
    const inicio = registro.inicio;
    const fim = registro.fim;
    const valor = registro.valor;
    if (!numeroFinito(inicio) || (!numeroFinito(fim) && fim !== null) || !numeroFinito(valor)) {
      return null;
    }
    return { inicio, fim, valor };
  }

  return null;
};

export function validarFaixasMensais(
  faixas: unknown,
  contexto: string,
): ProblemaRegraMensal[] {
  if (!Array.isArray(faixas)) {
    return [{ severidade: "erro", mensagem: `${contexto}: informe uma lista de faixas.` }];
  }

  const problemas: ProblemaRegraMensal[] = [];
  const normalizadas: FaixaNormalizada[] = [];

  faixas.forEach((faixa, indice) => {
    const normalizada = normalizarFaixa(faixa);
    if (!normalizada) {
      problemas.push({ severidade: "erro", mensagem: `${contexto}: a faixa ${indice + 1} possui valores inválidos.` });
      return;
    }

    if (normalizada.inicio < 0 || (normalizada.fim !== null && normalizada.fim < 0)) {
      problemas.push({ severidade: "erro", mensagem: `${contexto}: quantidades negativas não são permitidas.` });
    }
    if (normalizada.fim !== null && normalizada.inicio > normalizada.fim) {
      problemas.push({ severidade: "erro", mensagem: `${contexto}: o início não pode ser maior que o fim.` });
    }
    if (normalizada.valor < 0) {
      problemas.push({ severidade: "erro", mensagem: `${contexto}: o valor não pode ser negativo.` });
    }
    normalizadas.push(normalizada);
  });

  const ordenadas = [...normalizadas].sort((a, b) => a.inicio - b.inicio);
  for (let indice = 1; indice < ordenadas.length; indice += 1) {
    const anterior = ordenadas[indice - 1];
    const atual = ordenadas[indice];
    if (anterior.fim === null || atual.inicio <= anterior.fim) {
      problemas.push({ severidade: "erro", mensagem: `${contexto}: existem faixas sobrepostas.` });
    } else if (atual.inicio > anterior.fim + 1) {
      problemas.push({ severidade: "alerta", mensagem: `${contexto}: existe uma lacuna entre faixas.` });
    }
  }

  return problemas;
}

export function validarVigenciaMensal(
  inicio: string,
  fim?: string,
): ProblemaRegraMensal[] {
  if (!fim) return [];
  if (!inicio || !fim || inicio <= fim) return [];
  return [{ severidade: "erro", mensagem: "A vigência final não pode ser anterior à inicial." }];
}

export function validarConfiguracaoMensal(configuracao: unknown): ProblemaRegraMensal[] {
  if (!configuracao || typeof configuracao !== "object") return [];
  const raiz = configuracao as Record<string, unknown>;
  const fechamento = (raiz.fechamento_mensal ?? raiz) as Record<string, unknown>;
  const problemas: ProblemaRegraMensal[] = [];

  for (const [empresa, valorEmpresa] of Object.entries(fechamento)) {
    if (!valorEmpresa || typeof valorEmpresa !== "object") continue;
    for (const [unidade, valorUnidade] of Object.entries(valorEmpresa as Record<string, unknown>)) {
      if (!valorUnidade || typeof valorUnidade !== "object") continue;
      const dados = valorUnidade as Record<string, unknown>;
      const metas = dados.metas;
      if (metas && typeof metas === "object") {
        for (const [categoria, faixas] of Object.entries(metas as Record<string, unknown>)) {
          problemas.push(...validarFaixasMensais(faixas, `${empresa}/${unidade}/${categoria}`));
        }
      }
      for (const funcao of ["faixas_lideranca", "faixas_supervisao"]) {
        if (funcao in dados) {
          problemas.push(...validarFaixasMensais(dados[funcao], `${empresa}/${unidade}/${funcao}`));
        }
      }
    }
  }

  return problemas;
}

import { OrdemServico, TecnicoRowViewModel, FechamentoSemanalRules } from '../../../types';
import { FiltroListagemTecnicos } from './queryTecnicos';

export type ContagemListagemTecnicos = Record<FiltroListagemTecnicos, number>;

export class TecnicoService {
  public static chaveCliente(os: { codigo_cliente: string; numero_ordem_servico: string }): string {
    return os.codigo_cliente.trim() || os.numero_ordem_servico;
  }

  public static quantidadePorCliente(
    dados: Array<{ codigo_cliente: string; numero_ordem_servico: string }>,
  ): Map<string, number> {
    const quantidade = new Map<string, number>();

    for (const os of dados) {
      const chave = this.chaveCliente(os);
      quantidade.set(chave, (quantidade.get(chave) ?? 0) + 1);
    }

    return quantidade;
  }

  public static calcularValorRepasse(nome: string, rules: FechamentoSemanalRules): number {
    const terceirizados = rules?.tecnicos_terceirizados;
    if (!terceirizados) return 0;

    const nomeUpper = nome.toUpperCase().trim();
    for (const [chave, valor] of Object.entries(terceirizados)) {
      if (nomeUpper.includes(chave.toUpperCase())) {
        return valor;
      }
    }
    return 0; 
  }

  public static processar(
    dados: OrdemServico[],
    rules: FechamentoSemanalRules,
  ): TecnicoRowViewModel[] {
    return dados.map((os) => {
      const isAprovada = this.isOsPagaNoFechamento(os);
      const statusFin = isAprovada ? "PAGO" : "-";
      const vBase = isAprovada
        ? this.calcularValorRepasse(
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
  }

  public static processarEDeduplicar(
    dados: OrdemServico[],
    rules: FechamentoSemanalRules,
  ): TecnicoRowViewModel[] {
    return this.processar(dados, rules);
  }

  public static ordenarParaListagem(
    dados: TecnicoRowViewModel[],
    quantidadePorCliente: Map<string, number>,
  ): TecnicoRowViewModel[] {
    return [...dados].sort((a, b) => {
      const duplicadoA = (quantidadePorCliente.get(this.chaveCliente(a)) ?? 0) > 1 ? 0 : 1;
      const duplicadoB = (quantidadePorCliente.get(this.chaveCliente(b)) ?? 0) > 1 ? 0 : 1;
      if (duplicadoA !== duplicadoB) {
        return duplicadoA - duplicadoB;
      }

      const cliente = a.codigo_cliente.localeCompare(b.codigo_cliente);
      if (cliente !== 0) {
        return cliente;
      }

      return a.numero_ordem_servico.localeCompare(b.numero_ordem_servico);
    });
  }

  public static contarListagem(
    dados: TecnicoRowViewModel[],
    quantidadePorCliente: Map<string, number>,
  ): ContagemListagemTecnicos {
    const contagem: ContagemListagemTecnicos = {
      TODOS: dados.length,
      duplicados: 0,
      "pendente-auditoria": 0,
      aprovados: 0,
      reprovado: 0,
    };

    for (const os of dados) {
      const grupo = this.classificarListagem(os, quantidadePorCliente);
      if (grupo !== "TODOS") {
        contagem[grupo] += 1;
      }
    }

    return contagem;
  }

  public static filtrarListagem(
    dados: TecnicoRowViewModel[],
    filtro: FiltroListagemTecnicos,
    quantidadePorCliente: Map<string, number>,
  ): TecnicoRowViewModel[] {
    if (filtro === "TODOS") {
      return this.ordenarParaListagem(dados, quantidadePorCliente);
    }

    return this.ordenarParaListagem(
      dados.filter((os) => this.classificarListagem(os, quantidadePorCliente) === filtro),
      quantidadePorCliente,
    );
  }

  public static classificarListagem(
    os: TecnicoRowViewModel,
    quantidadePorCliente: Map<string, number>,
  ): FiltroListagemTecnicos {
    if ((quantidadePorCliente.get(this.chaveCliente(os)) ?? 0) > 1) {
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
  }

  private static isOsPagaNoFechamento(os: OrdemServico): boolean {
    return os.status_auditoria.toUpperCase().trim() === "APROVADO";
  }
}

import { API } from "@/lib/axios";

export type CommissionRuleApi = {
  id: number;
  nome: string;
  evento: "installation" | "removal" | "sale" | "maintenance";
  filters: string | null;
  ruleType: string;
  valor: number | string | null;
  config: Record<string, unknown> | null;
  ativo: boolean;
};

export type FechamentoSemanalValores = {
  tecnicosTerceirizados: Record<string, number>;
  retiradaEstado: Record<string, number>;
  autonomos: {
    valorPadrao: number;
    excecoes: Record<string, number>;
  };
};

function toNumber(valor: number | string | null): number {
  return Number(valor ?? 0);
}

export function mapRulesToSemanal(
  rules: CommissionRuleApi[],
): FechamentoSemanalValores {
  const tecnicosTerceirizados: Record<string, number> = {};
  const retiradaEstado: Record<string, number> = {};
  const excecoes: Record<string, number> = {};
  let valorPadrao = 0;

  rules
    .filter((regra) => regra.ativo)
    .forEach((regra) => {
      const chave = (regra.filters ?? regra.nome).toUpperCase().trim();
      const valor = toNumber(regra.valor);

      switch (regra.evento) {
        case "installation":
          tecnicosTerceirizados[chave] = valor;
          break;
        case "removal":
          retiradaEstado[chave] = valor;
          break;
        case "sale":
          if (chave === "PADRAO") {
            valorPadrao = valor;
            break;
          }
          excecoes[regra.nome] = valor;
          break;
        default:
          break;
      }
    });

  return {
    tecnicosTerceirizados,
    retiradaEstado,
    autonomos: {
      valorPadrao,
      excecoes,
    },
  };
}

export class CommissionRulesService {
  private static readonly path = "/commissions/rules";

  static async findAll() {
    const response = await API.get(this.path);
    return response.data as {
      data: CommissionRuleApi[];
      message: string;
    };
  }
  static async create(payload: {
    nome: string;
    evento: CommissionRuleApi["evento"];
    valor: number;
  }) {
    const response = await API.post(this.path, payload);
    return response.data as { data: CommissionRuleApi; message: string };
  }
  
  static async update(id: number, payload: { nome?: string; valor?: number }) {
    const response = await API.patch(`${this.path}/${id}`, payload);
    return response.data as { data: CommissionRuleApi; message: string };
  }
  
  static async remove(id: number) {
    const response = await API.delete(`${this.path}/${id}`);
    return response.data as { data: CommissionRuleApi; message: string };
  }
}
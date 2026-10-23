import regrasBase from "@/data/rules.json";

export type RegraMensal = {
  metas?: Record<string, unknown>;
  faixas_lideranca?: unknown[];
  faixas_supervisao?: unknown[];
  ordem_categorias?: string[];
  rotulos_categorias?: Record<string, string>;
};

export type ConfiguracaoMensal = {
  fechamento_mensal?: Record<string, Record<string, RegraMensal>>;
};

let configuracaoAtual: ConfiguracaoMensal = regrasBase as ConfiguracaoMensal;

export const obterConfiguracaoMensal = (): ConfiguracaoMensal => configuracaoAtual;

export const atualizarConfiguracaoMensal = (configuracao: ConfiguracaoMensal): void => {
  configuracaoAtual = configuracao;
};

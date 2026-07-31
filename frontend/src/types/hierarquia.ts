export type GrupoHierarquiaTipo = "GRUPO_UNIDADE" | "INTERNO" | "EXTERNO" | "RECEPCAO_UNIDADE";

export interface ColaboradorHierarquia {
  id: string;
  nome: string;
  cargo?: string;
}

export interface FiltroHierarquia {
  empresa: string;
  unidade: string;
  estado: string;
}

export interface HierarquiaUnidade {
  supervisor: ColaboradorHierarquia | null;
  grupoUnidade: ColaboradorHierarquia[];
  interno: ColaboradorHierarquia[];
  externo: ColaboradorHierarquia[];
  recepcaoUnidade: ColaboradorHierarquia[];
}
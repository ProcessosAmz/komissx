import { Host } from "./host.enum";

export enum OrdemServicoStatus {
    INSTALACAO = "instalacao",
    REMOCAO = "remocao",
    MANUTENCAO = "manutencao",
}

export const OrdemServicoTipoId = {
  [Host.MANIA]: {
    INSTALACAO: [
      8,
      465,
      492,
      493,
      494,
      495,
      503,
      505,
      508,
    ],
  },

  [Host.AMAZONET]: {
    INSTALACAO: [
      832,
      834,
      2,
      835,
      836,
      833,
      819,
      804,
    ],
  },
} as const;
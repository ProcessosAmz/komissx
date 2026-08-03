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
      // adicionar os id's do tipo de ordem da amazonet (os ids mudam devido ser outro banco de dados.)
    ],
  },
} as const;
import { Host } from "./host.enum";

export enum OrdemServicoStatus {
  INSTALACAO = "instalacao",
  MUDANCA_ENDERECO = "mudanca_endereco",
  NAO_CONFORMIDADE = "nao_conformidade",
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
    MUDANCA_ENDERECO: [
      471,
      478,
      489,
    ],
    NAO_CONFORMIDADE: [
      427,
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
    MUDANCA_ENDERECO: [
      808,
      815,
      829,
    ],
    NAO_CONFORMIDADE: [
      529,
    ],
  },
} as const;
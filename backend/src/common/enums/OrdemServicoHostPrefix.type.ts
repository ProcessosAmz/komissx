import { Host } from "./host.enum";

export const OrdemServicoHostPrefixo = {
    "0032": Host.AMAZONET,
    "0048": Host.MANIA,
  } as const;
  
  export type OrdemServicoHostPrefixoKey = keyof typeof OrdemServicoHostPrefixo;
export type Cargo = "SUPERVISOR" | "LIDER" | "TECNICO" | "AUTONOMO";

export type HierarquiaNode = {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  operadora: string;
  regional: string;
  idHubsoft: string;
  participaFechamento: boolean;
  children?: HierarquiaNode[];
};
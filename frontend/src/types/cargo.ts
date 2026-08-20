export type Cargo =
  | "SUPERVISOR"
  | "LIDER"
  | "BACKOFFICE"
  | "RECEPCAO"
  | "INTERNO"
  | "COMERCIAL INTERNO"
  | "COMERCIAL EXTERNO"
  | "REGIONAL INTERNO"
  | "REGIONAL EXTERNO"
  | "TECNICO"
  | "AUTONOMO";

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
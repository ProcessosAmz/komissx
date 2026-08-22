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
  | "REGIONAL EXTERNO PA"
  | "TECNICO"
  | "AUTONOMO";

export type HierarquiaNode = {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  roleId: string;
  empresaId: string;
  empresaName: string;
  unidadeId: string;
  unidadeName: string;
  supervisorId: string | null;
  operadora: string;
  regional: string;
  idHubsoft: string;
  participaFechamento: boolean;
  children?: HierarquiaNode[];
};
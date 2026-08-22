export type UserListItem = {
  id: string;
  name: string;
  email: string;
  hubsoftId: number | null;
  roleId: string;
  roleName: string;
  empresaId: string;
  empresaName: string;
  unidadeId: string;
  unidadeName: string;
  estadoId: string | null;
  estadoName: string | null;
  supervisorId: string | null;
  participaFechamento: boolean;
  active: boolean;
  children?: UserListItem[];
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  hubsoftId: number | null;
  roleId: string;
  empresaId: string;
  unidadeId: string;
  supervisorId: string | null;
  participaFechamento: boolean;
  active: boolean;
};

export type UpdateUserData = {
  name: string;
  email: string;
  password?: string;
  hubsoftId: number | null;
  roleId: string;
  empresaId: string;
  unidadeId: string;
  supervisorId: string | null;
  participaFechamento: boolean;
  active: boolean;
};
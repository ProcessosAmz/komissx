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
  
export type OpcaoFiltroApi = {
    id: string;
    name: string;
  };
  
  export type EstadoOpcao = OpcaoFiltroApi & {
    uf: string;
  };
  
  export type UnidadeOpcao = OpcaoFiltroApi & {
    empresaId: string;
    estadoId: string | null;
  };
  
  export type FiltroUsuarios = {
    empresaId?: string;
    unidadeId?: string;
    estadoId?: string;
    search?: string;
  };
  
  export type UserApiNode = {
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
    children?: UserApiNode[];
  };
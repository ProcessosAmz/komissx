export type Role = "ADMIN" | "OPERADOR";

export type PersonType =
    | "TECNICO" | "AUTONOMO" | "VENDEDOR"
    | "SUPERVISOR" | "COORDENADOR" | "CONSULTOR";

export type AuditStatus = "APROVADO" | "NC_APROVADO" | "REPROVADO" | "PENDENTE";
export type FinancialStatus = "PAGO" | "NAO_PAGO" | "EM_ANALISE";

export type Primitive = string | number | boolean;
export type Path = string;

export interface ClosingLine {
    id: string;
    empresa: string;
    unidade: string;
    relatorio: "FECHAMENTO_TECNICO" | "FECHAMENTO_RETIRADA" | "FECHAMENTO_VENDA";
    pessoa: { tipo: PersonType; nome: string; grupo?: string };
    meta?: { produto?: string; quantidade?: number; peso?: number };
    venda?: { plano?: string; velocidadeMB?: number; clienteNovo?: boolean };
    status: AuditStatus;
    valorBase: number;
}

export interface ClosingResult {
    lineId: string;
    valorAPagar: number;
    statusFinanceiro: FinancialStatus;
    regraAplicadaId: string;
    regraVersao: number;
    observacoes?: string;
    calculadoEm: string;
}

export interface RuleEscopo {
    empresa?: string;
    unidade?: string;
    relatorio?: ClosingLine["relatorio"];
    tipoPessoa?: PersonType;
    nomeContem?: string;
    grupo?: string;
}

export type Condition =
    | { op: "eq"; campo: Path; valor: Primitive }
    | { op: "neq"; campo: Path; valor: Primitive }
    | { op: "gte"; campo: Path; valor: number }
    | { op: "lte"; campo: Path; valor: number }
    | { op: "in"; campo: Path; valor: Primitive[] }
    | { op: "contains"; campo: Path; valor: string }
    | { op: "OR"; items: Condition[] }
    | { op: "NOT"; item: Condition };

export type Action =
    | { tipo: "SET_VALOR"; expressao: ValorExpressao }
    | { tipo: "SET_STATUS_FINANCEIRO"; status: FinancialStatus }
    | { tipo: "BONUS_FIXO"; valor: number }
    | { tipo: "PORCENTAGEM_SOBRE"; campo: Path; percentual: number }
    | { tipo: "OBSERVAR"; texto: string };

export type ValorExpressao =
    | { tipo: "FIXO"; valor: number }
    | { tipo: "PERCENTUAL_VALOR_BASE"; percentual: number }
    | { tipo: "FAIXA"; faixas: Array<{ ate: number; valor: number }> };

export interface Rule {
    id: string;
    nome: string;
    versao: number;
    ativa: boolean;
    escopo: RuleEscopo;
    condicoes: Condition[];
    acoes: Action[];
    criadoEm: string;
    observacoes?: string;
}

export interface User {
    id: number;
    tenantId: string;
    name: string;
    email: string;
    role: Role;
    active: boolean;
}

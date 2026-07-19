import { create } from "zustand";

// Definição estrita dos papéis com base na sua matriz de negócio
export type Role = 'ADMIN' | 'GERENTE' | 'SUPERVISORA' | 'LIDER' | 'TECNICO' | 'ESTUDANTE' | 'OPERADOR';

export interface User {
    id: number;
    tenantId: 'amazonet' | 'mania';
    name: string;
    email: string;
    role: Role;
    active: boolean;
    telas_fechamento?: string[]; // 🧠 CORREÇÃO: Adicionado campo opcional para evitar o erro 500 no TypeScript/Vite
}

interface AuthState {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    user: null, // Mude para um dos usuários da lista abaixo para testar perfis diferentes direto no F5
    login: (user) => set({ user }),
    logout: () => set({ user: null }),
}));

/**
 * Sistema de Controle de Acesso Baseado em Papéis (RBAC)
 * Mapeamento direto da sua tabela de permissões do KomissX
 */
export const PERMISSOES = {
    academy: (role: Role) => ['ADMIN', 'GERENTE', 'SUPERVISORA', 'LIDER', 'TECNICO', 'ESTUDANTE'].includes(role),
    // 🚀 CORREÇÃO: Adicionado 'OPERADOR' para que o Usuário A e B consigam acessar o Dashboard imediatamente após logar!
    producao: (role: Role) => ['ADMIN', 'GERENTE', 'SUPERVISORA', 'LIDER', 'TECNICO', 'OPERADOR'].includes(role), 
    // 🚀 CORREÇÃO: Adicionado 'OPERADOR' aqui também para que consigam ler a rota raiz do módulo de fechamentos
    fechamento: (role: Role) => ['ADMIN', 'GERENTE', 'SUPERVISORA', 'OPERADOR'].includes(role),
    configuracoes: (role: Role) => ['ADMIN', 'GERENTE'].includes(role), 
    administracao: (role: Role) => ['ADMIN'].includes(role),
};

// ==========================================
// MASSA DE DADOS PARA TESTES LOCAIS (MOCK)
// ==========================================
export const mockUsuariosTestes: (User & { password?: string })[] = [
    {
        id: 1,
        tenantId: "amazonet",
        name: "Administrador Geral",
        email: "processos@amazonett.com.br",
        password: "Teste1234",
        role: "ADMIN",
        active: true,
        telas_fechamento: [
            "mensal_comercial",
            "semanal_autonomo",
            "semanal_tecnico",
            "mensal_pj"
        ]
    },
    {
        id: 2,
        tenantId: "amazonet",
        name: "Gerente Operacional",
        email: "gerente@amazonett.com.br",
        password: "Teste1234",
        role: "GERENTE",
        active: true,
        telas_fechamento: []
    },
    {
        id: 3,
        tenantId: "mania",
        name: "Supervisora de Contas",
        email: "supervisora@mania.com.br",
        password: "Teste1234",
        role: "SUPERVISORA",
        active: true,
        telas_fechamento: []
    },
    {
        id: 4,
        tenantId: "amazonet",
        name: "Líder de Equipe",
        email: "lider@amazonett.com.br",
        password: "Teste1234",
        role: "LIDER",
        active: true,
        telas_fechamento: []
    },
    {
        id: 5,
        tenantId: "amazonet",
        name: "Técnico de Campo",
        email: "tecnico@amazonett.com.br",
        password: "Teste1234",
        role: "TECNICO",
        active: true,
        telas_fechamento: []
    },
    {
        id: 6,
        tenantId: "mania",
        name: "Estudante Novo",
        email: "estudante@mania.com.br",
        password: "Teste1234",
        role: "ESTUDANTE",
        active: true,
        telas_fechamento: []
    },
    // 👥 Incluídos Usuários A e B no Mock oficial da Store para testes consistentes
    {
        id: 7,
        tenantId: "amazonet",
        name: "Usuário A",
        email: "usuarioa@amazonett.com.br",
        password: "Teste1234",
        role: "OPERADOR",
        active: true,
        telas_fechamento: [
            "mensal_comercial",
            "semanal_autonomo"
        ]
    },
    {
        id: 8,
        tenantId: "amazonet",
        name: "Usuário B",
        email: "usuariob@amazonett.com.br",
        password: "Teste1234",
        role: "OPERADOR",
        active: true,
        telas_fechamento: [
            "semanal_tecnico",
            "mensal_pj"
        ]
    }
];
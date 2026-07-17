import { create } from "zustand";

// Definição estrita dos papéis com base na sua matriz de negócio
export type Role = 'ADMIN' | 'GERENTE' | 'SUPERVISORA' | 'LIDER' | 'TECNICO' | 'ESTUDANTE';

export interface User {
    id: number;
    tenantId: 'amazonet' | 'mania';
    name: string;
    email: string;
    role: Role;
    active: boolean;
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
    producao: (role: Role) => ['ADMIN', 'GERENTE', 'SUPERVISORA', 'LIDER', 'TECNICO'].includes(role),
    fechamento: (role: Role) => ['ADMIN', 'GERENTE', 'SUPERVISORA'].includes(role),
    configuracoes: (role: Role) => ['ADMIN', 'GERENTE'].includes(role), // Gerente com acesso Parcial/Visualização
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
        active: true
    },
    {
        id: 2,
        tenantId: "amazonet",
        name: "Gerente Operacional",
        email: "gerente@amazonett.com.br",
        password: "Teste1234",
        role: "GERENTE",
        active: true
    },
    {
        id: 3,
        tenantId: "mania",
        name: "Supervisora de Contas",
        email: "supervisora@mania.com.br",
        password: "Teste1234",
        role: "SUPERVISORA",
        active: true
    },
    {
        id: 4,
        tenantId: "amazonet",
        name: "Líder de Equipe",
        email: "lider@amazonett.com.br",
        password: "Teste1234",
        role: "LIDER",
        active: true
    },
    {
        id: 5,
        tenantId: "amazonet",
        name: "Técnico de Campo",
        email: "tecnico@amazonett.com.br",
        password: "Teste1234",
        role: "TECNICO",
        active: true
    },
    {
        id: 6,
        tenantId: "mania",
        name: "Estudante Novo",
        email: "estudante@mania.com.br",
        password: "Teste1234",
        role: "ESTUDANTE",
        active: true
    }
];
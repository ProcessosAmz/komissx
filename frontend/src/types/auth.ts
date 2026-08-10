// TODO: TROCAR ISSO DEPOIS
import { Role, User } from "@/stores/auth.store";

export interface LoginPayload {
    tenantId: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    data: User;
    message: string;
}

export const ROLES_PERMITIDAS: Role[] = [
    "ADMIN",
    "GERENTE",
    "SUPERVISORA",
    "LIDER",
    "TECNICO",
    "ESTUDANTE",
    "OPERADOR",
];
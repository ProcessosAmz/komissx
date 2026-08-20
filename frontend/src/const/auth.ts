import type { AuthModule, Role } from "@/types/auth";

export const ROLES = [
  "ADMIN",
  "GERENTE",
  "SUPERVISORA",
  "SUPERVISOR",
  "LIDER",
  "TECNICO",
  "ESTUDANTE",
  "OPERADOR",
  "BACKOFFICE",
  "RECEPCAO",
  "INTERNO",
  "COMERCIAL INTERNO",
  "COMERCIAL EXTERNO",
  "REGIONAL INTERNO",
  "REGIONAL EXTERNO",
  "REGIONAL EXTERNO PA",
] as const;

export const AUTH_MODULES = [
  "academy",
  "producao",
  "fechamento",
  "configuracoes",
  "administracao",
] as const;

export const MODULE_ROLES: Record<AuthModule, readonly Role[]> = {
  academy: ["ADMIN", "GERENTE", "SUPERVISORA", "SUPERVISOR", "LIDER", "TECNICO", "ESTUDANTE"],
  producao: ["ADMIN", "GERENTE", "SUPERVISORA", "SUPERVISOR", "LIDER", "TECNICO", "OPERADOR", "BACKOFFICE", "RECEPCAO", "INTERNO", "COMERCIAL INTERNO", "COMERCIAL EXTERNO", "REGIONAL INTERNO", "REGIONAL EXTERNO", "REGIONAL EXTERNO PA"],
  fechamento: ["ADMIN", "GERENTE", "SUPERVISORA", "SUPERVISOR", "OPERADOR"],
  configuracoes: ["ADMIN", "GERENTE"],
  administracao: ["ADMIN"],
};

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INACTIVE_USER: "INACTIVE_USER",
  UNSUPPORTED_ROLE: "UNSUPPORTED_ROLE",
  NETWORK_UNAVAILABLE: "NETWORK_UNAVAILABLE",
  UNEXPECTED: "UNEXPECTED",
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  INACTIVE_USER: "Usuário sem acesso liberado. Procure o administrador.",
  UNSUPPORTED_ROLE: "Perfil de usuário não parametrizado no sistema.",
  NETWORK_UNAVAILABLE: "Servidor indisponível. Verifique sua conexão.",
  UNEXPECTED: "Não foi possível autenticar agora. Tente novamente.",
} as const;

export const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const;
export const SESSION_STALE_TIME_IN_MS = 5 * 60 * 1000;

export const LOGIN_ROUTE = "/auth/login";
export const POST_LOGIN_ROUTE = "/admin";
export const FORBIDDEN_ROUTE = "/sem-permissao";
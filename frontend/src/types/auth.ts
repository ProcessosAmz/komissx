import type {
  AUTH_ERROR_CODES,
  AUTH_MODULES,
  ROLES,
} from "@/const/auth";

export type Role = (typeof ROLES)[number];
export type AuthModule = (typeof AUTH_MODULES)[number];
export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface SessionResponse {
  data: AuthenticatedUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
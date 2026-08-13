import type { ROLES, TENANT_IDS } from "@/constants/auth";

export type Role = (typeof ROLES)[number];
export type TenantId = (typeof TENANT_IDS)[number];

export interface AuthenticatedUser {
  id: number;
  tenantId: TenantId;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  telas_fechamento: string[];
}

export interface SessionResponse {
  data: AuthenticatedUser;
}

export interface LoginCredentials {
  tenantId: TenantId;
  email: string;
  password: string;
}
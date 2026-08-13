import { z } from "zod";
import { ROLES, TENANT_IDS } from "@/const/auth";
import type { AuthenticatedUser, SessionResponse } from "@/types/auth";

export const roleSchema = z.enum(ROLES);
export const tenantIdSchema = z.enum(TENANT_IDS);

export const authenticatedUserSchema = z.object({
  id: z.number().int().positive(),
  tenantId: tenantIdSchema,
  name: z.string().min(1, "Informe o nome."),
  email: z.email("E-mail inválido."),
  role: roleSchema,
  active: z.boolean(),
  telas_fechamento: z.array(z.string()).default([]),
}) satisfies z.ZodType<AuthenticatedUser, unknown>;

export const sessionResponseSchema = z.object({
  data: authenticatedUserSchema,
}) satisfies z.ZodType<SessionResponse, unknown>;
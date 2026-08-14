import { z } from "zod";
import { ROLES } from "@/const/auth";
import type {
  AuthenticatedUser,
  LoginCredentials,
  SessionResponse,
} from "@/types/auth";

export const roleSchema = z.enum(ROLES);

export const authenticatedUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Informe o nome."),
  email: z.email("E-mail inválido."),
  role: roleSchema,
  active: z.boolean(),
}) satisfies z.ZodType<AuthenticatedUser, unknown>;

export const sessionResponseSchema = z.object({
  data: authenticatedUserSchema,
}) satisfies z.ZodType<SessionResponse, unknown>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Informe o e-mail corporativo.")
    .pipe(z.email("E-mail inválido.")),
  password: z
    .string()
    .min(6, "A senha deve ter ao menos 6 caracteres.")
    .max(64, "Senha muito longa."),
}) satisfies z.ZodType<LoginCredentials, unknown>;

export type LoginFormData = z.infer<typeof loginSchema>;
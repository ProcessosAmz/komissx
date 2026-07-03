import { z } from "zod";

export const loginSchema = z.object({
  tenantId: z
    .string()
    .min(2, "Informe o identificador da empresa.")
    .max(60, "Identificador muito longo."),
  email: z
    .string()
    .min(1, "Informe o e-mail corporativo.")
    .email("E-mail inválido."),
  password: z
    .string()
    .min(6, "A senha deve ter ao menos 6 caracteres.")
    .max(64, "Senha muito longa."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

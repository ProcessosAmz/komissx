import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  hubsoftId: z.coerce.number().int().positive("Informe o ID Hubsoft."),
  roleId: z.string().uuid("Informe o ID do cargo."),
  empresaId: z.string().uuid("Informe o ID da empresa."),
  regionalId: z.string().uuid("Informe o ID da regional."),
  supervisorId: z.string().uuid("Informe o ID do supervisor.").nullable().optional(),
  participaFechamento: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
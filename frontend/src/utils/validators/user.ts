import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  hubsoftId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === "" || Number.isNaN(Number(value))) {
        return undefined;
      }

      return Number(value);
    })
    .refine(
      (value) => value === undefined || (Number.isInteger(value) && value > 0),
      "Informe o ID Hubsoft.",
    ),
  roleId: z.string().uuid("Informe o cargo."),
  empresaId: z.string().uuid("Informe a empresa."),
  unidadeId: z.string().uuid("Informe a unidade."),
  supervisorId: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().uuid("Informe o líder ou supervisor.").nullable(),
  ),
  participaFechamento: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormData = z.output<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value.trim().length === 0) {
        return undefined;
      }

      return value;
    })
    .refine(
      (value) => value === undefined || value.length >= 6,
      "A senha deve ter ao menos 6 caracteres.",
    ),
});

export type UpdateUserFormInput = z.input<typeof updateUserSchema>;
export type UpdateUserFormData = z.output<typeof updateUserSchema>;
import { z } from 'zod';

export const loginSchema = z.object({
  tenantId: z.string().min(1, 'O ID da empresa é obrigatório').trim(),
  email: z.string().email('Insira um e-mail válido').trim().lowercase(),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
import { z } from 'zod';
import { INTENTIONS, MODALITIES, COMPENSATION_TYPES } from './constants';

export const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'O usuário deve ter pelo menos 3 caracteres.')
    .max(30, 'O usuário deve ter no máximo 30 caracteres.')
    .regex(
      USERNAME_REGEX,
      'O usuário só pode conter letras, números, ponto, hífen e sublinhado.'
    ),
  password: z
    .string()
    .min(15, 'A senha deve ter pelo menos 15 caracteres.')
    .max(128, 'A senha deve ter no máximo 128 caracteres.'),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Informe seu usuário.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: z
    .string()
    .min(15, 'A nova senha deve ter pelo menos 15 caracteres.')
    .max(128, 'A nova senha deve ter no máximo 128 caracteres.'),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(500, 'A bio deve ter no máximo 500 caracteres.').optional().nullable(),
  visibility: z.enum(['public', 'members_only', 'private']).default('public'),
});

export const createPostSchema = z
  .object({
    intention: z.enum(INTENTIONS, {
      message: 'Selecione uma intenção válida.',
    }),
    title: z
      .string()
      .trim()
      .min(5, 'O título deve ter pelo menos 5 caracteres.')
      .max(120, 'O título deve ter no máximo 120 caracteres.'),
    description: z
      .string()
      .trim()
      .min(30, 'A descrição deve ter pelo menos 30 caracteres.')
      .max(5000, 'A descrição deve ter no máximo 5000 caracteres.'),
    opportunity_type_slug: z.string().min(1, 'Selecione o tipo de oportunidade.'),
    service_category_slug: z.string().min(1, 'Selecione a área profissional.'),
    modality: z.enum(MODALITIES, {
      message: 'Selecione a modalidade.',
    }),
    city: z.string().trim().max(100).optional().nullable(),
    state: z.string().trim().max(2).optional().nullable(),
    compensation_type: z.enum(COMPENSATION_TYPES, {
      message: 'Selecione a condição de remuneração.',
    }),
    amount_cents: z.number().int().nonnegative().optional().nullable(),
    amount_min_cents: z.number().int().nonnegative().optional().nullable(),
    amount_max_cents: z.number().int().nonnegative().optional().nullable(),
    amount_unit: z.string().trim().max(50).optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    origin_module: z.string().default('guilda'),
  })
  .superRefine((data, ctx) => {
    if (data.modality === 'Presencial' || data.modality === 'Híbrido') {
      if (!data.city || data.city.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'Cidade é obrigatória para modalidades presenciais ou híbridas.',
        });
      }
      if (!data.state || data.state.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'UF é obrigatória para modalidades presenciais ou híbridas.',
        });
      }
    }

    if (data.compensation_type === 'faixa') {
      if (
        data.amount_min_cents != null &&
        data.amount_max_cents != null &&
        data.amount_max_cents < data.amount_min_cents
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amount_max_cents'],
          message: 'O valor máximo da faixa não pode ser menor que o valor mínimo.',
        });
      }
    }

    if (data.deadline) {
      const deadlineDate = new Date(data.deadline);
      if (deadlineDate.getTime() < Date.now() - 60000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['deadline'],
          message: 'O prazo não pode ser uma data no passado.',
        });
      }
    }
  });

export const createApplicationSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, 'A mensagem de interesse deve ter pelo menos 5 caracteres.')
    .max(1000, 'A mensagem de interesse deve ter no máximo 1000 caracteres.'),
  proposed_amount_cents: z.number().int().nonnegative().optional().nullable(),
});

export const createReportSchema = z.object({
  post_id: z.string().uuid('ID de publicação inválido.'),
  category: z.string().min(2, 'Selecione uma categoria de denúncia.'),
  description: z
    .string()
    .trim()
    .min(10, 'A descrição da denúncia deve conter pelo menos 10 caracteres.')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres.'),
});

export const createQuoteRequestSchema = z.object({
  service_title: z
    .string()
    .trim()
    .min(3, 'O título do serviço solicitado deve ter pelo menos 3 caracteres.')
    .max(150, 'O título deve ter no máximo 150 caracteres.'),
  description: z
    .string()
    .trim()
    .min(20, 'Descreva os detalhes e escopo com pelo menos 20 caracteres.')
    .max(3000, 'A descrição deve ter no máximo 3000 caracteres.'),
  estimated_budget: z.string().trim().max(100).optional().nullable(),
});

export const createSupportRequestSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, 'O assunto deve ter pelo menos 5 caracteres.')
    .max(120, 'O assunto deve ter no máximo 120 caracteres.'),
  category: z.string().min(2, 'Selecione a categoria.'),
  message: z
    .string()
    .trim()
    .min(20, 'A mensagem deve ter pelo menos 20 caracteres.')
    .max(3000, 'A mensagem deve ter no máximo 3000 caracteres.'),
});

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const changeRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    message: 'Role must be user or admin',
  }),
});

export const deactivateUserSchema = z.object({
  is_active: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type DeactivateUserInput = z.infer<typeof deactivateUserSchema>;

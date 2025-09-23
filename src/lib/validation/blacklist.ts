import { z } from 'zod';

export const createBlacklistSchema = z.object({
  field: z.enum(['name', 'content', 'both'], {
    message: 'Field must be name, content, or both',
  }),
  pattern: z.string().min(1, 'Pattern is required'),
  is_regex: z.boolean().default(false),
  type: z.enum(['ANY', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS']).default('ANY'),
  description: z.string().optional(),
});

export const updateBlacklistSchema = createBlacklistSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'No fields to update' }
);

export type CreateBlacklistInput = z.infer<typeof createBlacklistSchema>;
export type UpdateBlacklistInput = z.infer<typeof updateBlacklistSchema>;

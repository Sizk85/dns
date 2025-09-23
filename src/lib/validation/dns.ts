import { z } from 'zod';

const base = {
  name: z.string().min(1, 'Name is required'),
  ttl: z.number().int().min(1).max(2147483647).optional(),
  proxied: z.boolean().optional(),
};

export const ARecord = z.object({
  type: z.literal('A'),
  ...base,
  content: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IPv4 address'),
});

export const AAAARecord = z.object({
  type: z.literal('AAAA'),
  ...base,
  content: z.string().regex(/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/, 'Invalid IPv6 address'),
});

export const CNAMERecord = z.object({
  type: z.literal('CNAME'),
  ...base,
  content: z.string().min(1, 'Content is required'),
});

export const TXTRecord = z.object({
  type: z.literal('TXT'),
  ...base,
  content: z.string().min(1, 'Content is required'),
});

export const MXRecord = z.object({
  type: z.literal('MX'),
  ...base,
  content: z.string().min(1, 'Content is required'),
  priority: z.number().int().min(0, 'Priority must be non-negative'),
});

export const NSRecord = z.object({
  type: z.literal('NS'),
  ...base,
  content: z.string().min(1, 'Content is required'),
});

export const SRVRecord = z.object({
  type: z.literal('SRV'),
  ...base,
  content: z.string().min(1, 'Content is required'),
  // SRV records have complex data structure in Cloudflare API
  // For now, use content string - can be expanded later
});

export const AnyRecord = z.discriminatedUnion('type', [
  ARecord,
  AAAARecord,
  CNAMERecord,
  TXTRecord,
  MXRecord,
  NSRecord,
  SRVRecord,
]);

export const PartialRecord = z.object({
  type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS']).optional(),
  name: z.string().min(1, 'Name is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  ttl: z.number().int().min(1).max(2147483647).optional(),
  proxied: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
}).refine(
  (v) => Object.keys(v).length > 0,
  { message: 'No fields to update' }
);

export type DNSRecordInput = z.infer<typeof AnyRecord>;
export type PartialDNSRecordInput = z.infer<typeof PartialRecord>;

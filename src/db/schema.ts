import { pgTable, serial, varchar, text, boolean, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin', 'owner']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  password_hash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('user'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 512 }).notNull().unique(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actor_user_id: integer('actor_user_id').notNull().references(() => users.id),
  action: varchar('action', { length: 64 }).notNull(), // e.g. dns.create, dns.update, user.role_change
  target_type: varchar('target_type', { length: 64 }).notNull(), // e.g. dns_record, blacklist, user
  target_id: varchar('target_id', { length: 128 }), // e.g. CF record id or local id
  metadata: jsonb('metadata'), // diff, payload snapshot (no secrets)
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const blacklist = pgTable('blacklist', {
  id: serial('id').primaryKey(),
  field: varchar('field', { length: 16 }).notNull(), // name | content | both
  pattern: text('pattern').notNull(), // glob or regex
  is_regex: boolean('is_regex').notNull().default(false),
  type: varchar('type', { length: 8 }).notNull().default('ANY'), // ANY | A | AAAA | CNAME | MX | TXT | SRV | NS
  description: text('description'),
  created_by: integer('created_by').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

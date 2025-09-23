import { db } from '@/db/client';
import { auditLogs } from '@/db/schema';
import { SessionUser } from './auth';
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
});

export interface AuditLogData {
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: Record<string, any>;
}

export async function createAuditLog(
  actor: SessionUser,
  data: AuditLogData
): Promise<void> {
  try {
    // Remove sensitive data from metadata
    const sanitizedMetadata = data.metadata ? sanitizeMetadata(data.metadata) : null;

    await db.insert(auditLogs).values({
      actor_user_id: actor.id,
      action: data.action,
      target_type: data.target_type,
      target_id: data.target_id || null,
      metadata: sanitizedMetadata,
    });

    // Also log to pino for debugging
    logger.info({
      audit: true,
      actor_id: actor.id,
      actor_email: actor.email,
      ...data,
      metadata: sanitizedMetadata,
    }, `Audit: ${data.action} on ${data.target_type}`);

  } catch (error) {
    logger.error({ error, data }, 'Failed to create audit log');
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}

function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized = { ...metadata };
  
  // Remove sensitive fields
  const sensitiveKeys = [
    'password',
    'password_hash',
    'token',
    'secret',
    'key',
    'auth',
    'authorization',
  ];

  function removeSensitive(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(removeSensitive);
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        cleaned[key] = '[REDACTED]';
      } else {
        cleaned[key] = removeSensitive(value);
      }
    }
    return cleaned;
  }

  return removeSensitive(sanitized);
}

// Predefined audit actions
export const AuditActions = {
  // DNS
  DNS_CREATE: 'dns.create',
  DNS_UPDATE: 'dns.update',
  DNS_DELETE: 'dns.delete',
  
  // Blacklist
  BLACKLIST_CREATE: 'blacklist.create',
  BLACKLIST_UPDATE: 'blacklist.update',
  BLACKLIST_DELETE: 'blacklist.delete',
  
  // Users
  USER_ROLE_CHANGE: 'user.role_change',
  USER_DEACTIVATE: 'user.deactivate',
  USER_ACTIVATE: 'user.activate',
  
  // Auth
  USER_LOGIN: 'auth.login',
  USER_LOGOUT: 'auth.logout',
  USER_REGISTER: 'auth.register',
} as const;

// Target types
export const AuditTargetTypes = {
  DNS_RECORD: 'dns_record',
  BLACKLIST: 'blacklist',
  USER: 'user',
} as const;

import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { auditLogs, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { apiSuccess, apiError, withAuth } from '@/lib/api';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    // Only admin and owner can view audit logs
    if (!requireRole(user, 'admin')) {
      return apiError('forbidden', 'No permission to view audit logs', 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        target_type: auditLogs.target_type,
        target_id: auditLogs.target_id,
        metadata: auditLogs.metadata,
        created_at: auditLogs.created_at,
        actor: {
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        },
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.actor_user_id, users.id))
      .orderBy(desc(auditLogs.created_at))
      .limit(limit);

    return apiSuccess({
      items: logs,
    });
  });
}

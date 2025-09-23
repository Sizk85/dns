import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { blacklist } from '@/db/schema';
import { createBlacklistSchema } from '@/lib/validation/blacklist';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError, withAuth } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'manageBlacklist')) {
      return apiError('forbidden', 'No permission to view blacklist', 403);
    }

    const blacklistRules = await db.select().from(blacklist);

    return apiSuccess({
      items: blacklistRules.map(rule => ({
        id: rule.id,
        field: rule.field,
        pattern: rule.pattern,
        is_regex: rule.is_regex,
        type: rule.type,
        description: rule.description,
        created_by: rule.created_by,
        created_at: rule.created_at,
      })),
    });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'manageBlacklist')) {
      return apiError('forbidden', 'No permission to create blacklist rules', 403);
    }

    const body = await request.json();
    const validatedData = createBlacklistSchema.parse(body);

    const [newRule] = await db
      .insert(blacklist)
      .values({
        field: validatedData.field,
        pattern: validatedData.pattern,
        is_regex: validatedData.is_regex,
        type: validatedData.type,
        description: validatedData.description || null,
        created_by: user.id,
      })
      .returning();

    // Create audit log
    await createAuditLog(user, {
      action: AuditActions.BLACKLIST_CREATE,
      target_type: AuditTargetTypes.BLACKLIST,
      target_id: newRule.id.toString(),
      metadata: {
        rule: validatedData,
      },
    });

    return apiSuccess(newRule, 201);
  });
}

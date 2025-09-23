import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { blacklist } from '@/db/schema';
import { updateBlacklistSchema } from '@/lib/validation/blacklist';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError, withAuth } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'manageBlacklist')) {
      return apiError('forbidden', 'No permission to update blacklist rules', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBlacklistSchema.parse(body);

    const [updatedRule] = await db
      .update(blacklist)
      .set(validatedData)
      .where(eq(blacklist.id, parseInt(id)))
      .returning();

    if (!updatedRule) {
      return apiError('not_found', 'Blacklist rule not found', 404);
    }

    // Create audit log
    await createAuditLog(user, {
      action: AuditActions.BLACKLIST_UPDATE,
      target_type: AuditTargetTypes.BLACKLIST,
      target_id: id,
      metadata: {
        changes: validatedData,
      },
    });

    return apiSuccess(updatedRule);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'manageBlacklist')) {
      return apiError('forbidden', 'No permission to delete blacklist rules', 403);
    }

    const { id } = await params;

    const [deletedRule] = await db
      .delete(blacklist)
      .where(eq(blacklist.id, parseInt(id)))
      .returning();

    if (!deletedRule) {
      return apiError('not_found', 'Blacklist rule not found', 404);
    }

    // Create audit log
    await createAuditLog(user, {
      action: AuditActions.BLACKLIST_DELETE,
      target_type: AuditTargetTypes.BLACKLIST,
      target_id: id,
      metadata: {
        deleted_rule: deletedRule,
      },
    });

    return apiSuccess({ id: parseInt(id), deleted: true });
  });
}

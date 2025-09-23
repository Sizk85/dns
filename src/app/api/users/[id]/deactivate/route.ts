import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { deactivateUserSchema } from '@/lib/validation/user';
import { getSession } from '@/lib/auth';
import { requireRole, canManageUser } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError, withAuth } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    if (!requireRole(user, 'owner')) {
      return apiError('forbidden', 'Only owners can deactivate users', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { is_active } = deactivateUserSchema.parse(body);

    // Get target user
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!targetUser) {
      return apiError('not_found', 'User not found', 404);
    }

    // Owner cannot deactivate themselves
    if (targetUser.id === user.id) {
      return apiError('forbidden', 'Cannot deactivate yourself', 403);
    }

    // Check if can manage this user
    if (!canManageUser(user, targetUser.role)) {
      return apiError('forbidden', 'Cannot manage this user', 403);
    }

    const wasActive = targetUser.is_active;

    // Update user status
    const [updatedUser] = await db
      .update(users)
      .set({ 
        is_active,
        updated_at: new Date(),
      })
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        is_active: users.is_active,
      });

    // Create audit log
    await createAuditLog(user, {
      action: is_active ? AuditActions.USER_ACTIVATE : AuditActions.USER_DEACTIVATE,
      target_type: AuditTargetTypes.USER,
      target_id: id,
      metadata: {
        target_user: {
          id: targetUser.id,
          email: targetUser.email,
        },
        was_active: wasActive,
        is_active,
      },
    });

    return apiSuccess(updatedUser);
  });
}

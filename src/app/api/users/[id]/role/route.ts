import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { changeRoleSchema } from '@/lib/validation/user';
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
      return apiError('forbidden', 'Only owners can change user roles', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = changeRoleSchema.parse(body);

    // Get target user
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!targetUser) {
      return apiError('not_found', 'User not found', 404);
    }

    // Owner cannot change their own role
    if (targetUser.id === user.id) {
      return apiError('forbidden', 'Cannot change your own role', 403);
    }

    // Check if can manage this user's role
    if (!canManageUser(user, targetUser.role)) {
      return apiError('forbidden', 'Cannot manage this user role', 403);
    }

    const oldRole = targetUser.role;

    // Update user role
    const [updatedUser] = await db
      .update(users)
      .set({ 
        role,
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
      action: AuditActions.USER_ROLE_CHANGE,
      target_type: AuditTargetTypes.USER,
      target_id: id,
      metadata: {
        target_user: {
          id: targetUser.id,
          email: targetUser.email,
        },
        old_role: oldRole,
        new_role: role,
      },
    });

    return apiSuccess(updatedUser);
  });
}

import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError, withAuth } from '@/lib/api';

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    if (!requireRole(user, 'owner')) {
      return apiError('forbidden', 'Only owners can view users', 403);
    }

    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      is_active: users.is_active,
      created_at: users.created_at,
    }).from(users);

    return apiSuccess({
      items: allUsers,
    });
  });
}

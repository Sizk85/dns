import { NextRequest } from 'next/server';
import { Client } from 'pg';
import { getAuthUser } from '@/lib/simple-auth';
import { requireRole } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!requireRole(user, 'owner')) {
      return apiError('forbidden', 'Only owners can view users', 403);
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const result = await client.query(
      'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    
    await client.end();

    return apiSuccess({
      items: result.rows,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

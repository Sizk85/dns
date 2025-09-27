import { NextRequest } from 'next/server';
import { Client } from 'pg';
import { createBlacklistSchema } from '@/lib/validation/blacklist';
import { getAuthUser } from '@/lib/simple-auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!hasPermission(user, 'manageBlacklist')) {
      return apiError('forbidden', 'No permission to view blacklist', 403);
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const result = await client.query('SELECT * FROM blacklist ORDER BY created_at DESC');
    await client.end();

    return apiSuccess({
      items: result.rows,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!hasPermission(user, 'manageBlacklist')) {
      return apiError('forbidden', 'No permission to create blacklist rules', 403);
    }

    const body = await request.json();
    const validatedData = createBlacklistSchema.parse(body);

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const result = await client.query(
      'INSERT INTO blacklist (field, pattern, is_regex, type, description, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        validatedData.field,
        validatedData.pattern,
        validatedData.is_regex,
        validatedData.type,
        validatedData.description || null,
        user.id,
      ]
    );

    await client.end();

    return apiSuccess(result.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}

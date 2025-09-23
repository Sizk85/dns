import { getSession } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET() {
  try {
    const user = await getSession();
    
    if (!user) {
      return apiError('unauthorized', 'No active session', 401);
    }

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    });

  } catch (error) {
    return apiError('server_error', 'Failed to get session', 500);
  }
}

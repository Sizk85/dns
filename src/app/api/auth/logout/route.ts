import { NextRequest } from 'next/server';
import { getSession, clearSessionCookie, deleteSession } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    
    if (user) {
      // Get current session token to delete it from DB
      const cookieStore = await cookies();
      const token = cookieStore.get('session')?.value;
      
      if (token) {
        await deleteSession(token);
      }

      // Create audit log
      await createAuditLog(user, {
        action: AuditActions.USER_LOGOUT,
        target_type: AuditTargetTypes.USER,
        target_id: user.id.toString(),
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        },
      });
    }

    // Clear session cookie
    await clearSessionCookie();

    return apiSuccess({ message: 'Logged out successfully' });

  } catch (error) {
    // Even if there's an error, clear the cookie
    await clearSessionCookie();
    return apiError('server_error', 'Logout error, but session cleared', 500);
  }
}

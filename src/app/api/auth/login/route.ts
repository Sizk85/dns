import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { loginSchema } from '@/lib/validation/user';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.is_active, true)
      ))
      .limit(1);

    if (!user) {
      return apiError('invalid_credentials', 'Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return apiError('invalid_credentials', 'Invalid email or password', 401);
    }

    // Create session
    const token = await createSession(user.id);
    await setSessionCookie(token);

    // Create audit log
    await createAuditLog(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      {
        action: AuditActions.USER_LOGIN,
        target_type: AuditTargetTypes.USER,
        target_id: user.id.toString(),
        metadata: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        },
      }
    );

    // For form submission, redirect instead of JSON response
    const isFormSubmission = request.headers.get('content-type')?.includes('application/x-www-form-urlencoded');
    
    if (isFormSubmission) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return apiSuccess({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
}

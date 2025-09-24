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
    // Handle both JSON and form data
    let email: string, password: string;
    
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      
      // Basic validation for form data
      if (!email || !password) {
        return apiError('validation_error', 'Email and password are required', 400);
      }
    } else {
      const body = await request.json();
      const parsed = loginSchema.parse(body);
      email = parsed.email;
      password = parsed.password;
    }

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

    // Create audit log (skip if error to not break login)
    try {
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
    } catch (auditError) {
      console.error('Audit log failed:', auditError);
      // Continue with login even if audit fails
    }

    // For form submission, redirect instead of JSON response
    if (contentType?.includes('application/x-www-form-urlencoded')) {
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

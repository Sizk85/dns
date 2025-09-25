import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { loginSchema } from '@/lib/validation/user';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/simple-auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';

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

    // Connect to database directly
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    // Find user by email
    const userResult = await client.query(
      'SELECT id, email, name, password_hash, role, is_active FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      await client.end();
      return apiError('invalid_credentials', 'Invalid email or password', 401);
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      await client.end();
      return apiError('invalid_credentials', 'Invalid email or password', 401);
    }

    // Create JWT token
    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set cookie
    await setAuthCookie(token);

    await client.end();

    // For form submission, redirect instead of JSON response
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return apiSuccess({
      success: true,
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

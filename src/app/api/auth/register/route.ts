import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { registerSchema } from '@/lib/validation/user';
import { hashPassword } from '@/lib/auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return apiError('conflict', 'User already exists', 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password_hash: passwordHash,
        name: name || null,
        role: 'user', // Default role
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        name: users.name,
      });

    return apiSuccess({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    }, 201);

  } catch (error) {
    return handleApiError(error);
  }
}

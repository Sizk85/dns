import { NextRequest } from 'next/server';
import { Client } from 'pg';
import { registerSchema } from '@/lib/validation/user';
import { hashPassword } from '@/lib/simple-auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Connect to database
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    // Check if user already exists
    const existingResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      await client.end();
      return apiError('conflict', 'User already exists', 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const newUserResult = await client.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name',
      [email, passwordHash, name || null, 'user']
    );

    const newUser = newUserResult.rows[0];
    await client.end();

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

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { users, sessions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

const AUTH_SECRET = process.env.AUTH_SECRET!;
const COOKIE_NAME = 'session';

export interface SessionUser {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

export interface SessionData {
  userId: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(data: SessionData): string {
  return jwt.sign(data, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionData | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as SessionData;
  } catch {
    return null;
  }
}

export async function createSession(userId: number): Promise<string> {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) throw new Error('User not found');

  const token = generateToken({
    userId: user[0].id,
    email: user[0].email,
    role: user[0].role,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    // Check if required env vars exist
    if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) {
      console.error('Missing required environment variables');
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) return null;

    // Verify token in database
    const sessionData = await db
      .select({
        user: {
          id: users.id,
          email: users.email,
          role: users.role,
          name: users.name,
          is_active: users.is_active,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.user_id, users.id))
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expires_at, new Date()),
          eq(users.is_active, true)
        )
      )
      .limit(1);

    if (!sessionData[0]) return null;

    return sessionData[0].user;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

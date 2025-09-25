// Edge-compatible auth helpers for middleware
import { cookies } from 'next/headers';

export interface SessionData {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

// Simple JWT decode without verification for middleware
function decodeJWTPayload(token: string): SessionData | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;

    // Only decode payload, don't verify signature in middleware
    return decodeJWTPayload(token);
  } catch (error) {
    console.error('Edge auth error:', error);
    return null;
  }
}
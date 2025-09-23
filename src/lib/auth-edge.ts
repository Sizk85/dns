// Edge-compatible auth helpers for middleware
// ไม่ใช้ jsonwebtoken เนื่องจากไม่รองรับ Edge Runtime
import { cookies } from 'next/headers';

export interface SessionData {
  userId: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
}

// Simple JWT decode without verification for middleware
// (Full verification happens in server components/API routes)
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
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) return null;

    // Only decode payload, don't verify signature in middleware
    // Full verification happens in server components
    return decodeJWTPayload(token);
  } catch {
    return null;
  }
}
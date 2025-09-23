import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthorizationError } from './rbac';
import { BlacklistBlockedError } from './blacklist';

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    ok: true,
    data,
  }, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return apiError(
      'validation_error',
      error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      400
    );
  }

  if (error instanceof AuthorizationError) {
    return apiError('forbidden', error.message, 403);
  }

  if (error instanceof BlacklistBlockedError) {
    return apiError('blacklist_blocked', error.message, 400);
  }

  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return apiError('not_found', error.message, 404);
    }

    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return apiError('conflict', error.message, 409);
    }

    if (error.message.includes('CF_API') || error.message.includes('Cloudflare')) {
      return apiError('cf_api_error', error.message, 502);
    }
  }

  return apiError('server_error', 'Internal server error', 500);
}

export async function withAuth<T>(
  handler: (user: any) => Promise<T>
): Promise<T | NextResponse<ApiResponse>> {
  try {
    const { getSession } = await import('./auth');
    const user = await getSession();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    return await handler(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'CF_API_TOKEN',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.CF_ZONE_ID && !process.env.CF_ZONE_NAME) {
    throw new Error('Either CF_ZONE_ID or CF_ZONE_NAME is required');
  }
}

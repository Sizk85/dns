import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/simple-auth';
import { apiSuccess } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    await clearAuthCookie();

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    // Even if there's an error, clear the cookie
    await clearAuthCookie();
    return NextResponse.redirect(new URL('/', request.url));
  }
}

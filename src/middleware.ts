import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth-edge';

// Protected routes that require authentication
const protectedRoutes = [
  '/dns',
  '/users',
  '/blacklist',
];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = [
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getSessionFromCookie();

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth route while already authenticated
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Role-based route protection
  if (user && pathname.startsWith('/users') && user.role !== 'owner') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (user && pathname.startsWith('/blacklist') && !['admin', 'owner'].includes(user.role)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

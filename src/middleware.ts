import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWTEdge } from '@/lib/edge-auth';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login'];

// Routes that require authentication (excluding root since it handles its own logic)
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/cases',
  '/documents',
  '/time-tracking',
  '/analytics'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔧 MIDDLEWARE: Processing request for:', pathname);
  
  // Skip middleware for root route - let the page component handle auth logic
  if (pathname === '/') {
    console.log('🔧 MIDDLEWARE: Skipping root route');
    return NextResponse.next();
  }
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  console.log('🔧 MIDDLEWARE: Route analysis:', {
    pathname,
    isPublicRoute,
    isProtectedRoute
  });

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  console.log('🔧 MIDDLEWARE: Auth token present:', !!token);
  if (token) {
    console.log('🔧 MIDDLEWARE: Token preview:', token.substring(0, 20) + '...');
  }

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    console.log('🔧 MIDDLEWARE: Redirecting to login - no token for protected route');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing a protected route with a token, verify it
  if (isProtectedRoute && token) {
    try {
      const decoded = await verifyJWTEdge(token);
      console.log('🔧 MIDDLEWARE: Token verified successfully for user:', decoded.email);
      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      console.log('🔧 MIDDLEWARE: Token verification failed:', error.message);
      console.log('🔧 MIDDLEWARE: Deleting invalid token and redirecting to login');
      // Token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // If accessing login with a valid token, redirect to dashboard
  if (pathname === '/login' && token) {
    try {
      const decoded = await verifyJWTEdge(token);
      console.log('🔧 MIDDLEWARE: Valid token on login page, redirecting to dashboard for:', decoded.email);
      // Token is valid, redirect to dashboard instead of root
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.log('🔧 MIDDLEWARE: Invalid token on login page, clearing and allowing access');
      // Token is invalid, clear it and allow access to login
      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      return response;
    }
  }

  console.log('🔧 MIDDLEWARE: Continuing normally for:', pathname);
  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure which routes this middleware should run on
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
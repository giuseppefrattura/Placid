import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, COOKIE_NAME } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyJWT(token) : null;
  
  const isApiRoute = pathname.startsWith('/api/');
  const isLoginRoute = pathname === '/login';
  
  // Protect API routes
  if (isApiRoute) {
    // We only protect contacts APIs in this middleware matcher configuration
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  } else {
    // Protect Pages
    if (!user) {
      // If not logged in and not on login page, redirect to login
      if (!isLoginRoute) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      // If logged in and trying to go to login, redirect to home dashboard
      if (isLoginRoute) {
        const dashboardUrl = new URL('/', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }
  
  return NextResponse.next();
}

// Match the main dashboard page, login page, and contacts api
export const config = {
  matcher: [
    '/',
    '/login',
    '/api/contacts/:path*',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Public paths that don't require authentication
const publicPaths = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Allow access to static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.') ||
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/user'))
  ) {
    return NextResponse.next();
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // No token found, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token using jose instead of jsonwebtoken
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    await jose.jwtVerify(token, secret);
    
    // Token is valid, allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    // Token is invalid, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

// Apply middleware to all routes except public assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
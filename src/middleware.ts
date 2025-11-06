import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Middleware to protect routes that require authentication
 *
 * Protected routes: /schedules, /payments, /dashboard
 * Public routes: /, /login, /api/auth/*
 *
 * @see https://next-auth.js.org/configuration/nextjs#middleware
 */
export default withAuth(
  function middleware() {
    // Additional custom logic can be added here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // User must have a valid token to access protected routes
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: ['/schedules/:path*', '/payments/:path*', '/dashboard/:path*'],
};

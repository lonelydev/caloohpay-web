import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

/**
 * Test-only endpoint to seed an authenticated NextAuth session for E2E.
 * Enabled only when ENABLE_TEST_SESSION_SEED=true.
 */
export async function GET() {
  // Hard-disable this endpoint in production for defense-in-depth
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  if (process.env.ENABLE_TEST_SESSION_SEED !== 'true') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Missing NEXTAUTH_SECRET' }, { status: 500 });
  }

  const jwtPayload: JWT = {
    accessToken: 'e2e_mock_token',
    authMethod: 'oauth',
    accessTokenExpires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    user: {
      id: 'e2e-user-123',
      name: 'E2E User',
      email: 'e2e@example.com',
      image: null,
    },
  };

  // Use NextAuth's JWT encoder to produce a compatible JWE token
  const token = await encode({ token: jwtPayload, secret, maxAge: 30 * 24 * 60 * 60 });

  const res = NextResponse.json({ ok: true });

  const isProd = process.env.NODE_ENV === 'production';
  const cookieName = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
  const cookieAttributes = ['Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (isProd) {
    cookieAttributes.push('Secure');
  }

  res.headers.append('Set-Cookie', `${cookieName}=${token}; ${cookieAttributes.join('; ')}`);
  return res;
}

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * NextAuth.js API Route Handler
 * Handles all authentication requests: signin, signout, callback, etc.
 *
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

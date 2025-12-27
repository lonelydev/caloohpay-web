/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Session } from 'next-auth';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { render } from '@testing-library/react';

/**
 * Create a typed NextAuth Session object for tests
 */
export function makeSession(partial?: Partial<Session>): Session {
  const base: Session = {
    accessToken: 'test_access_token',
    authMethod: 'oauth',
    expires: '2099-12-31T23:59:59.000Z',
    user: {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
  };
  const merged = { ...base, ...(partial || {}) } as Session;
  if (partial?.user) {
    merged.user = { ...base.user, ...partial.user } as Session['user'];
  }
  return merged;
}

/**
 * Create a Session object without an accessToken to test edge cases
 */
export function makeSessionWithoutToken(partial?: Partial<Session>): Session {
  const session = makeSession(partial);
  // Explicitly remove accessToken to simulate missing token scenarios
  delete (session as any).accessToken;
  return session;
}

/**
 * Render a component wrapped with NextAuth SessionProvider supplying the given session
 */
export function renderWithSession(ui: React.ReactElement, session?: Session) {
  const currentSession = session ?? makeSession();
  return render(ui, {
    wrapper: ({ children }) => (
      <NextAuthSessionProvider session={currentSession}>{children}</NextAuthSessionProvider>
    ),
  });
}

/**
 * Mock useSession() to return a specific session for client component tests
 */
export function mockUseSession(
  session?: Session,
  status: 'authenticated' | 'unauthenticated' | 'loading' = 'authenticated'
) {
  const mod: any = require('next-auth/react');
  const data = status === 'authenticated' ? (session ?? makeSession()) : null;
  if (mod.useSession && jest.isMockFunction(mod.useSession)) {
    mod.useSession.mockReturnValue({ data, status });
  } else {
    jest.spyOn(mod, 'useSession').mockReturnValue({ data, status });
  }
}

/**
 * Convenience: mock authenticated client state but without an accessToken
 */
export function mockUseSessionWithoutToken() {
  mockUseSession(makeSessionWithoutToken(), 'authenticated');
}

/**
 * Convenience: mock unauthenticated client state (data=null)
 */
export function mockUnauthenticatedSession() {
  mockUseSession(undefined, 'unauthenticated');
}

/**
 * Convenience: mock loading client state (data=null)
 */
export function mockLoadingSession() {
  mockUseSession(undefined, 'loading');
}

/**
 * Mock getServerSession() to resolve to a specific session for server/API route tests
 */
export function mockServerSession(session?: Session) {
  const mod: any = require('next-auth');
  const data = session ?? makeSession();
  if (mod.getServerSession && jest.isMockFunction(mod.getServerSession)) {
    mod.getServerSession.mockResolvedValue(data);
  } else {
    jest.spyOn(mod, 'getServerSession').mockResolvedValue(data);
  }
}

/**
 * Convenience: mock authenticated server/API state but without an accessToken
 */
export function mockServerSessionWithoutToken() {
  const mod: any = require('next-auth');
  const data = makeSessionWithoutToken();
  if (mod.getServerSession && jest.isMockFunction(mod.getServerSession)) {
    mod.getServerSession.mockResolvedValue(data);
  } else {
    jest.spyOn(mod, 'getServerSession').mockResolvedValue(data);
  }
}

/**
 * Convenience: mock unauthenticated server/API state (session=null)
 */
export function mockServerSessionUnauthenticated() {
  const mod: any = require('next-auth');
  if (mod.getServerSession && jest.isMockFunction(mod.getServerSession)) {
    mod.getServerSession.mockResolvedValue(null);
  } else {
    jest.spyOn(mod, 'getServerSession').mockResolvedValue(null);
  }
}

/**
 * Clear all auth-related spies/mocks
 */
export function clearSessionMocks() {
  const reactMod = require('next-auth/react');
  let serverMod: any = null;
  try {
    // Importing 'next-auth' (server) can pull in ESM deps in jsdom tests.
    // Wrap in try/catch so client-only tests don't fail on this require.

    serverMod = require('next-auth');
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to require next-auth in clearSessionMocks:', error);
    }
    serverMod = null;
  }
  if (reactMod.useSession && jest.isMockFunction(reactMod.useSession)) {
    reactMod.useSession.mockReset();
  }
  if (serverMod && serverMod.getServerSession && jest.isMockFunction(serverMod.getServerSession)) {
    serverMod.getServerSession.mockReset();
  }
  jest.restoreAllMocks();
}

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
    user: {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
  };
  return { ...base, ...(partial || {}) } as Session;
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
export function mockUseSession(session?: Session) {
  const mod: any = require('next-auth/react');
  const data = session ?? makeSession();
  if (mod.useSession && jest.isMockFunction(mod.useSession)) {
    mod.useSession.mockReturnValue({ data, status: 'authenticated' });
  } else {
    jest.spyOn(mod, 'useSession').mockReturnValue({ data, status: 'authenticated' });
  }
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
 * Clear all auth-related spies/mocks
 */
export function clearSessionMocks() {
  const reactMod = require('next-auth/react');
  let serverMod: any = null;
  try {
    // Importing 'next-auth' (server) can pull in ESM deps in jsdom tests.
    // Wrap in try/catch so client-only tests don't fail on this require.

    serverMod = require('next-auth');
  } catch {
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

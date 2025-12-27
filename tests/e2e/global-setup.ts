import { chromium, FullConfig } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

export default async function globalSetup(config: FullConfig) {
  if (process.env.ENABLE_TEST_SESSION_SEED !== 'true') {
    return;
  }

  const baseURL = config.use?.baseURL || 'http://localhost:3000';
  const stateFile = 'tests/e2e/.auth/state.json';

  // Ensure .auth directory exists
  await mkdir(dirname(stateFile), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Hit the session seed endpoint to set the NextAuth session cookie
  const response = await page.goto(baseURL + '/api/test/session');

  if (!response) {
    throw new Error('Failed to reach test session endpoint: no response received.');
  }

  if (!response.ok()) {
    throw new Error(
      `Failed to seed test session: ${response.status()} ${response.statusText()} for ${response.url()}`,
    );
  }

  // Verify that a NextAuth session cookie was actually set before saving storage state
  const { hostname } = new URL(baseURL);
  const cookies = await context.cookies();
  const hasSessionCookie = cookies.some(
    (cookie) =>
      (cookie.name === 'next-auth.session-token' ||
        cookie.name === '__Secure-next-auth.session-token') &&
      (cookie.domain === hostname || cookie.domain?.endsWith(`.${hostname}`)),
  );

  if (!hasSessionCookie) {
    throw new Error(
      'Failed to seed test session: NextAuth session cookie was not found after hitting /api/test/session.',
    );
  }
  // Persist storage state for all tests
  await context.storageState({ path: stateFile });

  await browser.close();
}

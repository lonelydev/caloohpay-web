import { chromium, FullConfig } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

export default async function globalSetup(config: FullConfig) {
  if (process.env.ENABLE_TEST_SESSION_SEED !== 'true') {
    return;
  }

  // Safer baseURL extraction with validation
  const firstProject = config.projects?.[0];
  if (!firstProject) {
    throw new Error('No Playwright projects configured');
  }

  const baseURL =
    (firstProject as { use?: { baseURL?: string } })?.use?.baseURL || 'http://localhost:3000';
  const stateFile = 'tests/e2e/.auth/state.json';

  // Ensure .auth directory exists
  await mkdir(dirname(stateFile), { recursive: true });

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Hit the session seed endpoint to set the NextAuth session cookie
    const response = await page.goto(baseURL + '/api/test/session');

    if (!response) {
      throw new Error(
        'Failed to reach test session endpoint: no response received.\n' +
          'Ensure NEXTAUTH_SECRET is set and the dev server is running.'
      );
    }

    if (!response.ok()) {
      throw new Error(
        `Failed to seed test session: ${response.status()} ${response.statusText()}\n` +
          `URL: ${response.url()}\n` +
          'Check that ENABLE_TEST_SESSION_SEED=true and NODE_ENV is not production.'
      );
    }

    // Verify that a NextAuth session cookie was set
    const cookies = await context.cookies();
    const hasSessionCookie = cookies.some(
      (cookie) =>
        cookie.name === 'next-auth.session-token' ||
        cookie.name === '__Secure-next-auth.session-token'
    );

    if (!hasSessionCookie) {
      throw new Error(
        'Failed to seed test session: NextAuth session cookie not found after /api/test/session.\n' +
          `Received cookies: ${cookies.map((c) => c.name).join(', ')}`
      );
    }

    // Persist storage state for all tests
    await context.storageState({ path: stateFile });
  } finally {
    // Always close browser, even on error
    await browser.close();
  }
}

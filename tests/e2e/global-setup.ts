import { chromium, FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  if (process.env.ENABLE_TEST_SESSION_SEED !== 'true') {
    return;
  }

  const baseURL =
    (config.projects[0] as { use?: { baseURL?: string } })?.use?.baseURL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Hit the session seed endpoint to set the NextAuth session cookie
  await page.goto(baseURL + '/api/test/session');

  // Persist storage state for all tests
  await context.storageState({ path: 'tests/e2e/.auth/state.json' });

  await browser.close();
}

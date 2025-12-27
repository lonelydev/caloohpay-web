import { test, expect } from '@playwright/test';

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

test.describe('Schedules Page', () => {
  test.skip(SEEDED, 'Skipped under seeded auth; redirect not expected.');
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/schedules', { waitUntil: 'domcontentloaded' });

    // Should redirect to login page - URL may include callbackUrl query param
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  /**
   * NOTE: Comprehensive E2E tests for authenticated schedules functionality
   * are covered in tests/e2e/pagination-stability.spec.ts which includes:
   * - Schedule list rendering
   * - Search functionality (local + API)
   * - Pagination controls
   * - Month navigation
   * - Loading states
   * - Error handling
   *
   * This file focuses on authentication-related behavior only.
   */
});

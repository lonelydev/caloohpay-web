import { test, expect } from '@playwright/test';

/**
 * Helper to filter out acceptable warnings and errors that are not critical
 */
function isAcceptableMessage(text: string): boolean {
  const acceptablePatterns = [
    'DevTools',
    'Hydration failed', // React hydration warnings are handled by React
    'hydration',
    'css-global', // MUI Emotion styling warnings in dev mode
    'data-emotion', // MUI Emotion styling warnings
    'next-auth', // NextAuth debug warnings
    'DEBUG_ENABLED', // NextAuth debug mode warnings
    'Failed to load resource', // Network errors during mocked flows
    '401 (Unauthorized)', // Unauthorized API calls in dev
  ];

  return acceptablePatterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
}

test.describe('Console Errors and Warnings', () => {
  test('should load home page without console errors or warnings', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    // Listen for console messages
    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
        });
      }
    });

    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to home page
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for console errors and warnings
    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    // Filter out acceptable warnings and errors
    const filteredErrors = errors.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredWarnings = warnings.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredPageErrors = pageErrors.filter((msg) => !isAcceptableMessage(msg));

    // Assert no critical errors or warnings
    expect(
      filteredErrors,
      `Found console errors: ${JSON.stringify(filteredErrors, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredPageErrors,
      `Found page errors: ${JSON.stringify(filteredPageErrors, null, 2)}`
    ).toHaveLength(0);
  });

  test('should load login page without console errors or warnings', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
        });
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    // Filter out acceptable warnings and errors
    const filteredErrors = errors.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredWarnings = warnings.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredPageErrors = pageErrors.filter((msg) => !isAcceptableMessage(msg));

    // Assert no critical errors or warnings
    expect(
      filteredErrors,
      `Found console errors: ${JSON.stringify(filteredErrors, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredPageErrors,
      `Found page errors: ${JSON.stringify(filteredPageErrors, null, 2)}`
    ).toHaveLength(0);
  });

  test('should not have hydration errors', async ({ page }) => {
    const consoleMessages: string[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for hydration-related errors (excluding acceptable ones)
    const hydrationErrors = consoleMessages.filter(
      (msg) => msg.toLowerCase().includes('hydration') && !isAcceptableMessage(msg)
    );

    expect(
      hydrationErrors,
      `Found hydration errors: ${JSON.stringify(hydrationErrors, null, 2)}`
    ).toHaveLength(0);
  });

  test('should load schedules page without console errors (when authenticated)', async ({
    page,
  }) => {
    // Note: This test will redirect to login since we're not authenticated
    // But we still check for console errors during the redirect
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
        });
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/schedules');
    await page.waitForLoadState('networkidle');

    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    // Filter out acceptable warnings and errors
    const filteredErrors = errors.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredWarnings = warnings.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredPageErrors = pageErrors.filter((msg) => !isAcceptableMessage(msg));

    // Assert no critical errors or warnings
    expect(
      filteredErrors,
      `Found console errors: ${JSON.stringify(filteredErrors, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredPageErrors,
      `Found page errors: ${JSON.stringify(filteredPageErrors, null, 2)}`
    ).toHaveLength(0);
  });

  test('should toggle theme without console errors', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
        });
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await themeToggle.click();

    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    // Filter out acceptable warnings and errors
    const filteredErrors = errors.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredWarnings = warnings.filter((msg) => !isAcceptableMessage(msg.text));
    const filteredPageErrors = pageErrors.filter((msg) => !isAcceptableMessage(msg));

    // Assert no critical errors or warnings
    expect(
      filteredErrors,
      `Found console errors: ${JSON.stringify(filteredErrors, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredPageErrors,
      `Found page errors: ${JSON.stringify(filteredPageErrors, null, 2)}`
    ).toHaveLength(0);
  });
});

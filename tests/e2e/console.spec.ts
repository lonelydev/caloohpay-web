import { test, expect } from '@playwright/test';

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

    // Filter out known acceptable warnings (if any)
    const filteredWarnings = warnings.filter((msg) => {
      // Add any acceptable warning patterns here if needed
      return !msg.text.includes('DevTools'); // Ignore DevTools warnings
    });

    // Assert no errors or warnings
    expect(errors, `Found console errors: ${JSON.stringify(errors, null, 2)}`).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(pageErrors, `Found page errors: ${JSON.stringify(pageErrors, null, 2)}`).toHaveLength(0);
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

    const filteredWarnings = warnings.filter((msg) => {
      return !msg.text.includes('DevTools');
    });

    expect(errors, `Found console errors: ${JSON.stringify(errors, null, 2)}`).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(pageErrors, `Found page errors: ${JSON.stringify(pageErrors, null, 2)}`).toHaveLength(0);
  });

  test('should not have hydration errors', async ({ page }) => {
    const consoleMessages: string[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for hydration-related errors
    const hydrationErrors = consoleMessages.filter((msg) =>
      msg.toLowerCase().includes('hydration')
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

    const filteredWarnings = warnings.filter((msg) => {
      return !msg.text.includes('DevTools');
    });

    expect(errors, `Found console errors: ${JSON.stringify(errors, null, 2)}`).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(pageErrors, `Found page errors: ${JSON.stringify(pageErrors, null, 2)}`).toHaveLength(0);
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

    // Wait a bit for any async effects
    await page.waitForTimeout(500);

    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    const filteredWarnings = warnings.filter((msg) => {
      return !msg.text.includes('DevTools');
    });

    expect(errors, `Found console errors: ${JSON.stringify(errors, null, 2)}`).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(pageErrors, `Found page errors: ${JSON.stringify(pageErrors, null, 2)}`).toHaveLength(0);
  });
});

import { test, expect } from '@playwright/test';

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

test.describe('Authentication Flow', () => {
  // Skip unauthenticated flow tests when session is pre-seeded
  test.skip(SEEDED, 'Skipped when session is seeded for authenticated E2E.');
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check for main elements
    await expect(page.getByRole('heading', { name: /CalOohPay Web/i })).toBeVisible();
    await expect(page.getByText(/Sign in with your PagerDuty account/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with PagerDuty/i })).toBeVisible();
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access protected route
    await page.goto('/schedules', { waitUntil: 'domcontentloaded' });

    // Should redirect to login - URL may include callbackUrl query param
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should display sign in button in header when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Check for sign in button
    const signInButton = page.getByRole('link', { name: /Sign In/i });
    await expect(signInButton).toBeVisible();
  });

  test('should trigger OAuth flow when sign in button is clicked', async ({ page }) => {
    await page.goto('/login');

    const signInButton = page.getByRole('button', { name: /Sign in with PagerDuty/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();

    // Note: Clicking triggers OAuth redirect to PagerDuty - cannot verify button state after redirect
    // This test verifies button is functional before OAuth flow
  });

  test('should display error message when OAuth fails', async ({ page }) => {
    // Navigate to login with error parameter
    await page.goto('/login?error=OAuthCallback');

    // Should display error message
    await expect(page.getByText(/Error handling OAuth callback/i)).toBeVisible();
  });

  test('should display different error messages for different error types', async ({ page }) => {
    const errorCases = [
      { param: 'OAuthSignin', message: /Error starting OAuth sign in/i },
      { param: 'CredentialsSignin', message: /Invalid credentials/i },
      { param: 'SessionRequired', message: /Please sign in to access this page/i },
    ];

    for (const { param, message } of errorCases) {
      await page.goto(`/login?error=${param}`);
      await expect(page.getByText(message)).toBeVisible();
    }
  });

  test('should show dark mode toggle in header', async ({ page }) => {
    await page.goto('/');

    // Check for theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();

    // Background should change (we can check for color change)
    // Note: This would need more specific selectors in a real test
  });

  test('should display help text on login page', async ({ page }) => {
    await page.goto('/login');

    // Check for required permissions section
    await expect(page.getByText(/Required Permissions/i)).toBeVisible();
    await expect(page.getByText(/Read access to schedules/i)).toBeVisible();
    await expect(page.getByText(/Read access to user information/i)).toBeVisible();
  });

  test('should have link to documentation', async ({ page }) => {
    await page.goto('/login');

    // Check for documentation link
    const docLink = page.getByRole('link', { name: /documentation/i });
    await expect(docLink).toBeVisible();
    await expect(docLink).toHaveAttribute('href', 'https://github.com/lonelydev/caloohpay');
    await expect(docLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Authenticated User Flow', () => {
  // Skip when session is not seeded
  test.skip(!SEEDED, 'Skipped in unauthenticated E2E projects.');

  test('should display user avatar when authenticated', async ({ page }) => {
    await page.goto('/');
    const avatar = page.locator('button[aria-label*="account"]');
    await expect(avatar).toBeVisible();
  });

  test('should allow access to protected routes when authenticated', async ({ page }) => {
    await page.goto('/schedules');
    await expect(page).toHaveURL('/schedules');
  });

  test('should display user menu on avatar click', async ({ page }) => {
    await page.goto('/');
    const avatar = page.locator('button[aria-label*="account"]');
    await avatar.click();
    await expect(page.getByText(/Sign Out/i)).toBeVisible();
  });

  test('should sign out successfully', async ({ page }) => {
    await page.goto('/');
    const avatar = page.locator('button[aria-label*="account"]');
    await avatar.click();
    await page.getByText(/Sign Out/i).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
  });
});

test.describe('Session Persistence', () => {
  // Skip when session is not seeded
  test.skip(!SEEDED, 'Skipped in unauthenticated E2E projects.');

  test('should maintain session across page refreshes', async ({ page }) => {
    await page.goto('/schedules');
    await page.reload();
    await expect(page).toHaveURL('/schedules');
  });

  test('should maintain session across navigation', async ({ page }) => {
    await page.goto('/schedules');
    await page.goto('/');
    await page.goto('/schedules');
    await expect(page).toHaveURL('/schedules');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Schedules Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, we'd mock authentication here
    await page.goto('/schedules');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/schedules');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test.describe('Authenticated User', () => {
    // Skip these tests until we have proper auth mocking setup
    test.skip('should display page header and description', async ({ page }) => {
      // TODO: Mock authenticated session

      await expect(page.getByRole('heading', { name: /On-Call Schedules/i })).toBeVisible();
      await expect(
        page.getByText(/Select a schedule to calculate on-call compensation/i)
      ).toBeVisible();
    });

    test.skip('should display search input', async ({ page }) => {
      // TODO: Mock authenticated session

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    test.skip('should display schedule count', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      await expect(page.getByText(/schedule.*found/i)).toBeVisible();
    });

    test.skip('should filter schedules by search query', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Type in search box
      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('engineering');

      // Should filter schedules
      await expect(page.getByText('Engineering On-Call')).toBeVisible();
      await expect(page.getByText('Support Team')).not.toBeVisible();
    });

    test.skip('should display schedules in grid layout', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Check for grid container
      const schedules = page.locator('[role="article"]');
      await expect(schedules).toHaveCount(3); // Assuming 3 mock schedules
    });

    test.skip('should display schedule card with all details', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Check first schedule card
      const firstCard = page.locator('[role="article"]').first();

      await expect(firstCard.getByRole('heading')).toBeVisible();
      await expect(firstCard.getByText(/time zone/i)).toBeVisible();
    });

    test.skip('should show hover effect on schedule cards', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const firstCard = page.locator('[role="article"]').first();

      // Hover over card
      await firstCard.hover();

      // Card should have hover styles (transform, shadow, etc.)
      // This would need to check computed styles
    });

    test.skip('should display empty state when no schedules found', async ({ page }) => {
      // TODO: Mock authenticated session with no schedules

      await expect(page.getByText(/No schedules available/i)).toBeVisible();
      await expect(page.getByText(/Create schedules in PagerDuty to get started/i)).toBeVisible();
    });

    test.skip('should display empty state with search query', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Search for non-existent schedule
      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('nonexistent schedule name');

      await expect(page.getByText(/No schedules found/i)).toBeVisible();
      await expect(page.getByText(/Try adjusting your search query/i)).toBeVisible();
    });

    test.skip('should maintain search query in URL', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('engineering');

      // URL should reflect search (if implemented)
      // await expect(page).toHaveURL(/\?.*query=engineering/);
    });

    test.skip('should clear search when input is cleared', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);

      // Fill search
      await searchInput.fill('engineering');
      await expect(page.locator('[role="article"]')).toHaveCount(1);

      // Clear search
      await searchInput.clear();
      await expect(page.locator('[role="article"]')).toHaveCount(3);
    });

    test.skip('should display loading state while fetching schedules', async ({ page }) => {
      // TODO: Mock authenticated session with delayed response

      // Should show loading spinner
      await expect(page.getByText(/Loading schedules/i)).toBeVisible();

      // Wait for schedules to load
      await expect(page.getByRole('heading', { name: /On-Call Schedules/i })).toBeVisible();
    });

    test.skip('should display error state when API fails', async ({ page }) => {
      // TODO: Mock authenticated session with API error

      await expect(page.getByText(/Failed to Load Schedules/i)).toBeVisible();
      await expect(page.getByText(/Unable to fetch schedules from PagerDuty/i)).toBeVisible();

      // Should have retry button
      const retryButton = page.getByRole('button', { name: /Try Again/i });
      await expect(retryButton).toBeVisible();
    });

    test.skip('should retry loading schedules on error', async ({ page }) => {
      // TODO: Mock authenticated session with API error, then success

      const retryButton = page.getByRole('button', { name: /Try Again/i });
      await retryButton.click();

      // Should reload and show schedules
      await expect(page.getByRole('heading', { name: /On-Call Schedules/i })).toBeVisible();
    });

    test.skip('should handle case-insensitive search', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);

      // Search with different cases
      await searchInput.fill('ENGINEERING');
      await expect(page.getByText('Engineering On-Call')).toBeVisible();

      await searchInput.fill('engineering');
      await expect(page.getByText('Engineering On-Call')).toBeVisible();

      await searchInput.fill('EnGiNeErInG');
      await expect(page.getByText('Engineering On-Call')).toBeVisible();
    });

    test.skip('should display schedule timezone', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Check for timezone chips
      await expect(page.getByText('America/New_York')).toBeVisible();
      await expect(page.getByText('UTC')).toBeVisible();
    });
  });
});

test.describe('Schedules Page - Integration', () => {
  test.skip('should navigate to schedule detail on card click', async ({ page }) => {
    // TODO: Mock authenticated session and implement navigation

    await page.goto('/schedules');

    const firstCard = page.locator('[role="article"]').first();
    await firstCard.click();

    // Should navigate to schedule detail page
    await expect(page).toHaveURL(/\/schedules\/[A-Z0-9]+/);
  });

  test.skip('should preserve Header and Footer', async ({ page }) => {
    // TODO: Mock authenticated session

    await page.goto('/schedules');

    // Check for header
    await expect(page.getByText('CalOohPay')).toBeVisible();

    // Check for footer
    await expect(page.getByText(/© \d{4}/)).toBeVisible();
  });

  test.skip('should support keyboard navigation', async ({ page }) => {
    // TODO: Mock authenticated session and schedules data

    await page.goto('/schedules');

    // Tab through schedule cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // First card should be focused
    const firstCard = page.locator('[role="article"]').first();
    await expect(firstCard).toBeFocused();

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/schedules\/[A-Z0-9]+/);
  });
});

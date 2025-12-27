import { test, expect } from '@playwright/test';

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

/**
 * SKIPPED: These tests require authenticated state to access /schedules
 * To enable these tests, implement proper authentication mocking in beforeEach
 *
 * These visual regression tests verify:
 * - Pagination controls don't move when navigating
 * - Grid height remains constant across pages
 * - Card dimensions are consistent
 *
 * Current workaround: Unit tests in PaginationControls.test.tsx verify button states
 * TODO: Enable once auth mocking pattern from schedules.spec.ts is extracted to a test helper
 */

test.describe('Pagination Controls Stability', () => {
  // These visual stability tests are sensitive to layout/pagination timing.
  // Skip when running with seeded auth to avoid flakiness from mocked data.
  test.skip(SEEDED, 'Skipped under seeded auth; run in dedicated visual suite.');
  test.beforeEach(async ({ page }) => {
    // Ensure we start from home (session should be seeded when enabled)
    await page.goto('/');

    // Mock schedules API with deterministic pagination dataset
    await page.route('**/api/schedules**', async (route) => {
      const url = new URL(route.request().url());
      const limit = parseInt(url.searchParams.get('limit') || '16', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);

      // Generate 40 mock schedules
      const total = 40;
      const all = Array.from({ length: total }, (_, i) => ({
        id: `SCHED_${i + 1}`,
        name: `Schedule ${i + 1}`,
        description: `Mock schedule description ${i + 1}`,
        time_zone: 'UTC',
      }));

      const slice = all.slice(offset, offset + limit);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schedules: slice,
          total,
          limit,
          offset,
          more: offset + limit < total,
        }),
      });
    });
  });

  test('pagination controls should not move when navigating between full pages', async ({
    page,
  }) => {
    await page.goto('/schedules');

    // Wait for schedules to load
    await page.waitForSelector('[role="article"]', { timeout: 10000 });

    // Get initial position of pagination controls
    const paginationStack = page.locator('nav[aria-label="pagination navigation"]').first();
    const initialBox = await paginationStack.boundingBox();

    expect(initialBox).not.toBeNull();
    const initialY = initialBox!.y;

    // Click Next button
    await page.getByRole('button', { name: /next/i }).first().click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Get new position of pagination controls
    const newBox = await paginationStack.boundingBox();
    expect(newBox).not.toBeNull();
    const newY = newBox!.y;

    // Position should be exactly the same (allowing 1px tolerance for rendering)
    expect(Math.abs(newY - initialY)).toBeLessThanOrEqual(1);
  });

  test('pagination controls should not move when navigating to partial last page', async ({
    page,
  }) => {
    await page.goto('/schedules');

    // Wait for schedules to load
    await page.waitForSelector('[role="article"]', { timeout: 10000 });

    // Get initial position
    const paginationStack = page.locator('nav[aria-label="pagination navigation"]').first();
    const initialBox = await paginationStack.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialY = initialBox!.y;

    // Navigate to last page (which might have fewer than 16 cards)
    const lastButton = page.getByRole('button', { name: /last/i }).first();
    await lastButton.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Get new position
    const newBox = await paginationStack.boundingBox();
    expect(newBox).not.toBeNull();
    const newY = newBox!.y;

    // Position should remain stable
    expect(Math.abs(newY - initialY)).toBeLessThanOrEqual(1);
  });

  test('pagination controls should not move during loading state', async ({ page }) => {
    await page.goto('/schedules');

    // Wait for initial load
    await page.waitForSelector('[role="article"]', { timeout: 10000 });

    // Get initial position
    const paginationStack = page.locator('nav[aria-label="pagination navigation"]').first();
    const initialBox = await paginationStack.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialY = initialBox!.y;

    // Start navigation and immediately check position (during loading)
    const nextButton = page.getByRole('button', { name: /next/i }).first();
    await nextButton.click();

    // Check position immediately during loading overlay
    await page.waitForSelector('[role="progressbar"]', { timeout: 1000 }).catch(() => {
      // Loading might be too fast, that's okay
    });

    const loadingBox = await paginationStack.boundingBox();
    if (loadingBox) {
      const loadingY = loadingBox.y;
      // Position should remain stable even during loading
      expect(Math.abs(loadingY - initialY)).toBeLessThanOrEqual(1);
    }

    // Wait for load to complete
    await page.waitForLoadState('networkidle');

    // Final position check
    const finalBox = await paginationStack.boundingBox();
    expect(finalBox).not.toBeNull();
    const finalY = finalBox!.y;

    expect(Math.abs(finalY - initialY)).toBeLessThanOrEqual(1);
  });

  test('grid height should remain constant with different card counts', async ({ page }) => {
    await page.goto('/schedules');

    // Wait for schedules to load
    await page.waitForSelector('[role="article"]', { timeout: 10000 });

    // Get grid container
    const gridContainer = page.locator('[role="article"]').first().locator('..').locator('..');

    // Get initial grid height on first page (likely 16 cards)
    const initialBox = await gridContainer.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialHeight = initialBox!.height;

    // Navigate to last page (likely fewer cards)
    await page.getByRole('button', { name: /last/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Get grid height on last page
    const finalBox = await gridContainer.boundingBox();
    expect(finalBox).not.toBeNull();
    const finalHeight = finalBox!.height;

    // Grid height should be the same regardless of card count
    expect(Math.abs(finalHeight - initialHeight)).toBeLessThanOrEqual(5);
  });

  test('pagination controls should remain visible during all navigation', async ({ page }) => {
    await page.goto('/schedules');

    await page.waitForSelector('[role="article"]', { timeout: 10000 });

    const paginationStack = page.locator('nav[aria-label="pagination navigation"]').first();

    // Verify visible initially
    await expect(paginationStack).toBeVisible();

    // Navigate and check visibility
    await page.getByRole('button', { name: /next/i }).first().click();

    // Should remain visible during loading
    await expect(paginationStack).toBeVisible();

    // Wait for load
    await page.waitForLoadState('networkidle');

    // Should remain visible after load
    await expect(paginationStack).toBeVisible();

    // Navigate to last page
    await page.getByRole('button', { name: /last/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Should remain visible on last page
    await expect(paginationStack).toBeVisible();
  });

  test('card dimensions should be consistent across all pages', async ({ page }) => {
    await page.goto('/schedules');

    await page.waitForSelector('[role="article"]', { timeout: 10000 });

    // Get first card dimensions on page 1
    const firstCard = page.locator('[role="article"]').first();
    const firstCardBox = await firstCard.boundingBox();
    expect(firstCardBox).not.toBeNull();
    const firstWidth = firstCardBox!.width;
    const firstHeight = firstCardBox!.height;

    // Navigate to another page
    await page.getByRole('button', { name: /next/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Get first card dimensions on page 2
    const secondCard = page.locator('[role="article"]').first();
    const secondCardBox = await secondCard.boundingBox();
    expect(secondCardBox).not.toBeNull();
    const secondWidth = secondCardBox!.width;
    const secondHeight = secondCardBox!.height;

    // Card dimensions should be identical
    expect(Math.abs(secondWidth - firstWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(secondHeight - firstHeight)).toBeLessThanOrEqual(1);

    // Navigate to last page (might have fewer cards)
    await page.getByRole('button', { name: /last/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Get first card dimensions on last page
    const lastCard = page.locator('[role="article"]').first();
    const lastCardBox = await lastCard.boundingBox();
    expect(lastCardBox).not.toBeNull();
    const lastWidth = lastCardBox!.width;
    const lastHeight = lastCardBox!.height;

    // Card dimensions should still be identical
    expect(Math.abs(lastWidth - firstWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(lastHeight - firstHeight)).toBeLessThanOrEqual(1);
  });
});

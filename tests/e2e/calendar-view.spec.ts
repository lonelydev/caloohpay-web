import { test, expect, type Page } from '@playwright/test';
import { DateTime } from 'luxon';

/**
 * Runs in the seeded-auth projects with /api/schedules mocked in the browser.
 * Tests that look at entries must fail when none render (see
 * openCalendarWithEntries), so a broken mock can't turn them silently green.
 *
 * These tests verify:
 * - Calendar view toggle functionality
 * - Event rendering in calendar
 * - Event detail dialog interactions
 * - Month navigation with external controls
 * - FullCalendar built-in navigation is disabled
 * - Timezone handling
 */

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

/**
 * Switches to calendar view and waits for a mocked person's day bar. Fails the
 * test if no entry renders, so every check below runs against real entries.
 * Bars are named "<person> • <hh:mm>–<hh:mm> • £<amount>".
 */
async function openCalendarWithEntries(page: Page) {
  await page.getByRole('button', { name: /calendar view/i }).click();
  const johnBars = page.getByRole('button', { name: /^John Doe •/ });
  await expect(johnBars.first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Jane Smith •/ }).first()).toBeVisible();
  return johnBars;
}

async function openJohnDoeDialog(page: Page) {
  const johnBars = await openCalendarWithEntries(page);
  await johnBars.first().click();
  const dialog = page.getByRole('dialog', { name: 'John Doe' });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('Calendar View E2E Tests', () => {
  // Skip when session is not seeded, since protected routes will redirect
  test.skip(!SEEDED, 'Skipped in unauthenticated E2E projects.');

  test.beforeEach(async ({ page }) => {
    // Mock authentication session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user',
            email: 'test@example.com',
            name: 'Test User',
          },
          accessToken: 'mock-token',
          authMethod: 'oauth',
          expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    // Mock schedule detail API with events in the current month
    await page.route('**/api/schedules/*', async (route) => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();

      const makeISO = (d: Date) => d.toISOString();

      const entry1Start = makeISO(new Date(Date.UTC(year, month, 5, 17, 0, 0)));
      const entry1End = makeISO(new Date(Date.UTC(year, month, 12, 9, 0, 0)));
      const entry2Start = makeISO(new Date(Date.UTC(year, month, 15, 17, 0, 0)));
      const entry2End = makeISO(new Date(Date.UTC(year, month, 22, 9, 0, 0)));

      const mockSchedule = {
        schedule: {
          id: 'SCHED123',
          name: 'Test Schedule',
          description: 'Test on-call schedule',
          time_zone: 'America/New_York',
          html_url: 'https://example.pagerduty.com/schedules/SCHED123',
          final_schedule: {
            name: 'Test Schedule',
            rendered_schedule_entries: [
              {
                start: entry1Start,
                end: entry1End,
                user: {
                  id: 'USER1',
                  summary: 'John Doe',
                  name: 'John Doe',
                  email: 'john@example.com',
                  html_url: 'https://example.pagerduty.com/users/USER1',
                },
              },
              {
                start: entry2Start,
                end: entry2End,
                user: {
                  id: 'USER2',
                  summary: 'Jane Smith',
                  name: 'Jane Smith',
                  email: 'jane@example.com',
                  html_url: 'https://example.pagerduty.com/users/USER2',
                },
              },
            ],
          },
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSchedule),
      });
    });
  });

  test('should display calendar view toggle buttons', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Check for view toggle buttons
    const listViewButton = page.getByRole('button', { name: /list view/i });
    const calendarViewButton = page.getByRole('button', { name: /calendar view/i });

    await expect(listViewButton).toBeVisible();
    await expect(calendarViewButton).toBeVisible();
  });

  test('should switch from list view to calendar view', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Initially should show list view
    await expect(page.getByText(/On-Call Schedule/)).toBeVisible();

    // Click calendar view button
    const calendarViewButton = page.getByRole('button', { name: /calendar view/i });
    await calendarViewButton.click();

    // Wait for calendar to render
    await page.waitForSelector('.fc', { timeout: 5000 });

    // Calendar should be visible
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();
  });

  test('should display events in calendar view', async ({ page }) => {
    await page.goto('/schedules/SCHED123');

    await openCalendarWithEntries(page);

    // Plain names render as written, with no HTML entity codes
    await expect(page.locator('.fc')).not.toContainText('&#x');
  });

  test('should open event detail dialog when clicking an event', async ({ page }) => {
    await page.goto('/schedules/SCHED123');

    const dialog = await openJohnDoeDialog(page);

    await expect(dialog).toContainText('john@example.com');
  });

  test('should display compensation details in event dialog', async ({ page }) => {
    await page.goto('/schedules/SCHED123');

    const dialog = await openJohnDoeDialog(page);

    await expect(dialog.getByText(/PAYMENT CALCULATION/i)).toBeVisible();
    await expect(dialog.getByText(/Total Compensation/i)).toBeVisible();
    await expect(dialog.getByText(/weekday|weekend/i).first()).toBeVisible();
  });

  test('should close event dialog when clicking close button', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    const dialog = await openJohnDoeDialog(page);

    await dialog.getByRole('button', { name: /close/i }).click();

    await expect(dialog).toBeHidden();
    await expect(page.locator('.fc')).toBeVisible();
  });

  test('should switch back to list view from calendar view', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc', { timeout: 5000 });

    // Switch back to list view
    const listViewButton = page.getByRole('button', { name: /list view/i });
    await listViewButton.click();

    // List view should be visible again
    await expect(page.getByText(/On-Call Schedule/)).toBeVisible();

    // Calendar should not be visible
    await expect(page.locator('.fc')).not.toBeVisible();
  });

  test('should persist month navigation in calendar view', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc', { timeout: 5000 });

    // Get current month title
    const titleBefore = await page.locator('.fc-toolbar-title').textContent();

    // Use page-level next month button (icon-only button with aria-label)
    const nextButton = page.getByRole('button', { name: 'Next month' });
    await nextButton.click();

    // Month should change - wait for title to change
    await page.locator('.fc-toolbar-title').waitFor({ state: 'attached' });
    const titleAfter = await page.locator('.fc-toolbar-title').textContent();

    expect(titleBefore).not.toBe(titleAfter);
  });

  test('should display correct timezone in event details', async ({ page }) => {
    await page.goto('/schedules/SCHED123');

    const dialog = await openJohnDoeDialog(page);

    // John Doe's shift starts on the 5th at 17:00 UTC; the dialog shows it in
    // the schedule's zone, America/New_York, with its UTC offset (e.g. -0400)
    const now = new Date();
    const start = DateTime.fromJSDate(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 5, 17, 0, 0))
    ).setZone('America/New_York');
    await expect(dialog).toContainText(`From: ${start.toFormat('EEE yyyy/MM/dd, HH:mm ZZZ')}`);
  });

  test('should handle empty schedule gracefully in calendar view', async ({ page }) => {
    // Mock empty schedule
    // The page adds ?since=…&until=…, so match the path with or without a query
    await page.route(/\/api\/schedules\/EMPTY123(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schedule: {
            id: 'EMPTY123',
            name: 'Empty Schedule',
            time_zone: 'UTC',
            html_url: 'https://example.pagerduty.com/schedules/EMPTY123',
            final_schedule: {
              name: 'Empty Schedule',
              rendered_schedule_entries: [],
            },
          },
        }),
      });
    });

    await page.goto('/schedules/EMPTY123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();

    // Calendar should render without errors
    await page.waitForSelector('.fc', { timeout: 5000 });
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();

    // Prove the empty schedule loaded before asserting there's nothing on it;
    // otherwise "no entries" would also pass when the data never arrived.
    await expect(page.getByText('Empty Schedule').first()).toBeVisible();
    await expect(page.locator('[data-testid^="day-segment-"]')).toHaveCount(0);
  });

  test('should maintain view mode when navigating months', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc', { timeout: 5000 });

    // Click next month
    const nextMonthButton = page.getByRole('button', { name: /next/i }).first();
    await nextMonthButton.click();

    // Wait for calendar to re-render with new data
    await page.locator('.fc-daygrid').waitFor({ state: 'attached' });

    // Should still be in calendar view
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();
  });

  test('should render partial-day on-call as late-start short horizontal segment', async ({
    page,
  }) => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    await page.route(/\/api\/schedules\/PARTIAL123(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schedule: {
            id: 'PARTIAL123',
            name: 'Partial Day Schedule',
            time_zone: 'UTC',
            html_url: 'https://example.pagerduty.com/schedules/PARTIAL123',
            final_schedule: {
              name: 'Partial Day Schedule',
              rendered_schedule_entries: [
                {
                  start: new Date(Date.UTC(year, month, 1, 17, 0, 0)).toISOString(),
                  end: new Date(Date.UTC(year, month, 1, 23, 59, 0)).toISOString(),
                  user: {
                    id: 'PARTIAL_USER',
                    summary: 'Eakan',
                    name: 'Eakan',
                    email: 'eakan@example.com',
                    html_url: 'https://example.pagerduty.com/users/PARTIAL_USER',
                  },
                },
              ],
            },
          },
        }),
      });
    });

    await page.goto('/schedules/PARTIAL123');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc', { timeout: 5000 });

    // Exactly one bar, and it must be this schedule's person (not another mock's)
    const segments = page.locator('[data-testid^="day-segment-"]');
    await expect(segments).toHaveCount(1);
    const segment = segments.first();
    await expect(segment).toBeVisible();
    await expect(segment).toHaveAccessibleName(/^Eakan •/);

    const leftPercent = Number(await segment.getAttribute('data-left-percent'));
    const widthPercent = Number(await segment.getAttribute('data-width-percent'));

    expect(leftPercent).toBeGreaterThan(50);
    expect(widthPercent).toBeLessThan(100);
    expect(widthPercent).toBeGreaterThan(0);
  });

  test('should not display FullCalendar built-in navigation buttons', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc', { timeout: 5000 });

    // FullCalendar's built-in navigation buttons should not be present
    await expect(page.locator('.fc-prev-button')).not.toBeVisible();
    await expect(page.locator('.fc-next-button')).not.toBeVisible();
    await expect(page.locator('.fc-today-button')).not.toBeVisible();

    // But the month title should still be visible
    await expect(page.locator('.fc-toolbar-title')).toBeVisible();

    // And page-level navigation should be present (icon-only buttons with aria-labels)
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next month' })).toBeVisible();
  });
});

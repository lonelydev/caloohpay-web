import { test, expect } from '@playwright/test';

/**
 * SKIPPED: These tests require authenticated state and proper API mocking for /schedules/[id]
 * To enable these tests, implement proper authentication mocking consistent with other E2E tests
 *
 * These tests verify:
 * - Calendar view toggle functionality
 * - Event rendering in calendar
 * - Event detail dialog interactions
 * - Month navigation with external controls
 * - FullCalendar built-in navigation is disabled
 * - Timezone handling
 *
 * Current workaround: Unit tests in CalendarView.test.tsx verify component behavior
 */

test.describe.skip('Calendar View E2E Tests', () => {
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

    // Mock schedule detail API
    await page.route('**/api/schedules/*', async (route) => {
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
                start: '2024-01-01T17:00:00Z',
                end: '2024-01-08T09:00:00Z',
                user: {
                  id: 'USER1',
                  summary: 'John Doe',
                  name: 'John Doe',
                  email: 'john@example.com',
                  html_url: 'https://example.pagerduty.com/users/USER1',
                },
              },
              {
                start: '2024-01-15T17:00:00Z',
                end: '2024-01-22T09:00:00Z',
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
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();

    // Wait for calendar and events to render
    await page.waitForSelector('.fc-event', { timeout: 5000 });

    // Should display events
    const events = page.locator('.fc-event');
    const eventCount = await events.count();
    expect(eventCount).toBeGreaterThan(0);
  });

  test('should open event detail dialog when clicking an event', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();

    // Wait for calendar events
    await page.waitForSelector('.fc-event', { timeout: 5000 });

    // Click on first event
    const firstEvent = page.locator('.fc-event').first();
    await firstEvent.click();

    // Dialog should open
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Dialog should contain user information
    await expect(dialog.getByText(/John Doe|Jane Smith/)).toBeVisible();
  });

  test('should display compensation details in event dialog', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();

    // Wait and click event
    await page.waitForSelector('.fc-event', { timeout: 5000 });
    await page.locator('.fc-event').first().click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const dialog = page.locator('[role="dialog"]');

    // Should show payment calculation
    await expect(dialog.getByText(/PAYMENT CALCULATION/i)).toBeVisible();
    await expect(dialog.getByText(/Total Compensation/i)).toBeVisible();

    // Should show weekday/weekend breakdown
    await expect(dialog.getByText(/weekday|weekend/i)).toBeVisible();
  });

  test('should close event dialog when clicking close button', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view and open event
    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc-event', { timeout: 5000 });
    await page.locator('.fc-event').first().click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Click close button
    const closeButton = page.getByRole('button', { name: /close/i });
    await closeButton.click();

    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
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

    // Use page-level next month button (not FullCalendar's built-in buttons which are now removed)
    const nextButton = page.getByRole('button', { name: /next month/i });
    await nextButton.click();

    // Month should change
    await page.waitForTimeout(500); // Wait for animation
    const titleAfter = await page.locator('.fc-toolbar-title').textContent();

    expect(titleBefore).not.toBe(titleAfter);
  });

  test('should display correct timezone in event details', async ({ page }) => {
    await page.goto('/schedules/SCHED123');
    await page.waitForLoadState('networkidle');

    // Switch to calendar view
    await page.getByRole('button', { name: /calendar view/i }).click();
    await page.waitForSelector('.fc-event', { timeout: 5000 });
    await page.locator('.fc-event').first().click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const dialog = page.locator('[role="dialog"]');

    // Should display timezone information (EST/EDT for America/New_York)
    await expect(dialog.getByText(/EST|EDT/)).toBeVisible();
  });

  test('should handle empty schedule gracefully in calendar view', async ({ page }) => {
    // Mock empty schedule
    await page.route('**/api/schedules/EMPTY123', async (route) => {
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

    // Should show no events
    const events = page.locator('.fc-event');
    await expect(events).toHaveCount(0);
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

    // Wait for new data to load
    await page.waitForTimeout(1000);

    // Should still be in calendar view
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();
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

    // And page-level navigation should be present
    await expect(page.getByRole('button', { name: /previous month/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next month/i })).toBeVisible();
  });
});

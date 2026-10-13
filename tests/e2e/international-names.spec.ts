import { test, expect, type Page } from '@playwright/test';

/**
 * People's names must display exactly as written: accents, apostrophes and
 * all. React escapes text when it renders, so the app must not HTML-encode
 * names itself; doing so showed "João" as "Jo&#xE3;o".
 */

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

const JOAO = 'João Silva';
const JOSE = 'José García';

async function mockScheduleWithNames(page: Page) {
  await page.route('**/api/schedules/*', async (route) => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const iso = (day: number, hour: number) =>
      new Date(Date.UTC(year, month, day, hour, 0, 0)).toISOString();
    const user = (id: string, name: string, email: string) => ({
      id,
      summary: name,
      name,
      email,
      html_url: `https://example.pagerduty.com/users/${id}`,
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        schedule: {
          id: 'SCHEDINTL',
          name: 'International Team',
          description: 'Names with accents',
          time_zone: 'Europe/London',
          html_url: 'https://example.pagerduty.com/schedules/SCHEDINTL',
          final_schedule: {
            name: 'International Team',
            rendered_schedule_entries: [
              { start: iso(5, 17), end: iso(8, 9), user: user('PJOAO', JOAO, 'joao@example.com') },
              {
                start: iso(15, 17),
                end: iso(18, 9),
                user: user('PJOSE', JOSE, 'jose@example.com'),
              },
            ],
          },
        },
      }),
    });
  });
}

test.describe('Names with accents', () => {
  test.skip(!SEEDED, 'Skipped in unauthenticated E2E projects.');

  test.beforeEach(async ({ page }) => {
    await mockScheduleWithNames(page);
    await page.goto('/schedules/SCHEDINTL');
  });

  test('list view shows accented names as written', async ({ page }) => {
    await expect(page.getByRole('heading', { name: JOAO })).toBeVisible();
    await expect(page.getByRole('heading', { name: JOSE })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('&#x');
  });

  test('calendar view shows accented names on the bars and in the details dialog', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /calendar view/i }).click();

    // Each shift spans several days, so each person has several bars
    const joaoBars = page.getByRole('button', { name: new RegExp(`^${JOAO} •`) });
    const joseBars = page.getByRole('button', { name: new RegExp(`^${JOSE} •`) });
    await expect(joaoBars.first()).toBeVisible();
    await expect(joseBars.first()).toBeVisible();
    await expect(page.locator('.fc')).not.toContainText('&#x');

    await joseBars.first().click();
    const dialog = page.getByRole('dialog', { name: JOSE });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('jose@example.com');
  });
});

---
name: e2e-triage
description: Choose, run and triage Playwright E2E tests (seeded vs unauthenticated projects, headed vs headless) and tell real failures from seed/auth/flaky problems. Use when an E2E spec fails, or when a UI flow changes and you need to decide which E2E to run.
---

# E2E triage

Docs: `docs/e2e-test-runner.md`. Specs: `tests/e2e/`. Wrappers: `scripts/e2e-run.sh <auth|unauth> <headed|headless> [--project=…]`.
Projects (see `playwright.config.ts`): `chromium|firefox|webkit (seeded)` and `… (unauth)`.

## Pick the run

| Change                                                                   | Run                                                                                    |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Logged-in pages (schedules, calendar, settings, payment grid, analytics) | `npm run test:e2e:seeded` (chromium only, fastest)                                     |
| Login page, redirects, route protection                                  | `npm run test:e2e:unauth`                                                              |
| One spec                                                                 | `./scripts/e2e-run.sh auth headless --project="chromium (seeded)" tests/e2e/<spec>.ts` |
| Cross-browser rendering issue                                            | `npm run test:e2e:seeded:all`                                                          |
| Need to watch it                                                         | `npm run test:e2e:seeded:ui`                                                           |

Seeded mode sets `ENABLE_TEST_SESSION_SEED=true` and uses `/api/test/session` to mint a fake NextAuth session (token `e2e_mock_token`). PagerDuty is not reachable with it, so specs must mock or stub API responses. E2E is slow: run it only when a user flow changed, after `npm run verify` passes.

## Triage a failure

1. Read the failure and open the report: `npm run test:e2e:report` (artifacts in `playwright-report/` and `test-results/`, both gitignored). Look at the trace/screenshot first.
2. Classify:
   - **Auth/seed**: redirected to `/login`, 404 from `/api/test/session` → wrong mode (`auth` vs `unauth`), missing `NEXTAUTH_SECRET`, or `NODE_ENV=production`.
   - **Locator drift**: element exists but role/name changed → update the locator (prefer `getByRole`/`getByLabel`), not a sleep.
   - **Real regression**: assertion on data or behaviour fails reproducibly → write/extend a unit test that reproduces it, then fix the code.
   - **Flaky**: passes on rerun → find the race (missing `await expect(...)` auto-wait, animation, SWR revalidation) and fix it; never add `waitForTimeout` or blanket retries.
3. Rerun the single failing project three times to confirm it is stable.
4. Report: spec, project, classification, root cause, fix, and the exact command that now passes.

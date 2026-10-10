---
name: multi-schedule-overlap-check
description: Verify that a change to multi-schedule payment calculation (the report route, payment grid or compensation grid) still attributes each on-call day exactly once per user across overlapping schedules. Use on any change to /api/reports/multi-schedule, payment-grid or CompensationGrid.
---

# Multi-schedule overlap check

The cost of getting this wrong is paying someone twice (or not at all) for the same on-call time. Spec: `product-specs/multi-schedule-payment-calculation.md`.

Code: `src/app/api/reports/multi-schedule/route.ts` (sweep-line over per-user intervals, then `OnCallPeriod` from `@/lib/caloohpay`),
`src/lib/types/multi-schedule.ts`, `src/components/schedules/CompensationGrid.tsx`, `src/app/schedules/payment-grid/page.tsx`.
Tests: `src/app/api/reports/multi-schedule/__tests__/route.test.ts`, `src/app/schedules/payment-grid/__tests__/page.test.tsx`.

## Invariants to prove

1. **No double counting.** One user on schedules A and B for the same time counts that time once; the grid shows which schedule(s) it came from.
2. **No loss.** Total OOH days for a user across schedules >= the max of any single schedule, and <= the sum.
3. **Single-schedule parity.** A multi-schedule request with one schedule gives the same totals as the single-schedule path.
4. **Month boundary.** A shift that starts on the last day and ends next month is counted in the month it starts (see the one-day query extension in the route).
5. **Rates.** Weekend = Fri–Sun. Rates come from the request/`getDefaultRates()`, not hard-coded.
6. **Auth.** Unauthenticated → 401; invalid `scheduleIds` / dates → 400.

## Steps

1. Read the spec and the diff. Identify which invariant the change could affect.
2. Add or extend route tests with fixed ISO timestamps and mocked `createPagerDutyClient` (no network) for each affected case:
   - fully overlapping schedules for one user (two schedules, identical shift);
   - partial overlap that crosses the 17:30 cut-off;
   - non-overlapping shifts on different schedules for one user;
   - month-end overnight shift;
   - two users, one shared schedule.
3. Compute the expected totals by hand in the test (don't derive them from the code under test).
4. `npx jest src/app/api/reports src/app/schedules/payment-grid`, then `npm run verify`.
5. Report which invariants are covered by which test and any that are not.

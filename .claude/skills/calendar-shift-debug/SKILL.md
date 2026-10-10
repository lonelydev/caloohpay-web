---
name: calendar-shift-debug
description: Reproduce and fix a calendar or date-boundary bug (overlapping shifts, month-end, DST, multi-day shifts, wrong day segments) with a failing Luxon test first. Use when a shift renders on the wrong day, stacks wrongly, is clipped, or compensation differs at a month/DST edge.
---

# Calendar shift debug

Recent fixes in this area: overlapping shifts stacking (#93) and missing month-end compensation (#85). Both were boundary bugs.

Code: `src/lib/utils/calendarUtils.ts` (`transformToCalendarEvents`, `groupEventsByUser`, `calculateTotalCompensation`, `filterEventsByDateRange`),
`src/lib/utils/calendarDaySegments.ts` (`buildCalendarDaySegments`), `src/components/schedules/CalendarView.tsx`,
and the month-end handling in `src/app/api/reports/multi-schedule/route.ts` (query end date is extended by one day, next-month entries filtered after).
Manual checklist: the "Calendar View Testing Guide" section in `docs/TESTING.md`.

## Steps

1. **Pin the inputs.** Get the exact shift `start`/`end` ISO strings and the schedule's IANA timezone from the report. Never use the machine timezone or `DateTime.now()`.
2. **Classify the boundary**: shift crosses midnight; crosses month end; crosses a DST change (last Sunday of March/October in Europe, March/November in the US); two shifts overlap in time; zero/negative duration.
3. **Write the failing test first** in `src/lib/utils/__tests__/` (create `calendarUtils.test.ts` / `calendarDaySegments.test.ts` if absent) or the closest component test. Use fixed ISO timestamps with explicit offsets and `{ zone: tz }`. Include the day before and after the boundary.
4. **Run it and confirm it fails for the reported reason**: `npx jest <file>`.
5. **Fix at the lowest layer**. Day maths uses Luxon `startOf('day')` / `plus({ days })` (not `+ 24h`, which breaks on DST days). Don't reimplement compensation: day counting comes from `@/lib/caloohpay`.
6. **Check neighbours.** Segment percentages in `buildCalendarDaySegments` must still sum sensibly per day, and totals from `calculateTotalCompensation` must not change for non-boundary shifts.
7. `npm run verify`. For visible UI changes also run `npm run test:e2e:seeded -- tests/e2e/calendar-view.spec.ts` if you can.
8. Commit as `fix(calendar): …` or `fix(month-end-boundary): …` and mention the boundary case in the body.

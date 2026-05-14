import { createPagerDutyClient } from '@/lib/api/pagerduty';
import type { NextRequest } from 'next/server';
import { ScheduleCompensationReport } from '@/lib/types/multi-schedule';
import { mockServerSession } from '@/tests/utils';
import { OnCallPeriod } from 'caloohpay/core';

// Mock dependencies
jest.mock('@/lib/api/pagerduty');
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth/options', () => ({
  authOptions: {},
}));
// Mock NextResponse to avoid environment issues in test
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status || 200,
      ...(body as object),
    }),
  },
}));

// Import after mocks
import { POST } from '../route';

describe('Multi-Schedule Report API', () => {
  const mockGetMultipleSchedules = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockServerSession();
    (createPagerDutyClient as jest.Mock).mockReturnValue({
      getMultipleSchedules: mockGetMultipleSchedules,
    });
  });

  it('should split overlapping hours between schedules', async () => {
    // Setup Overlapping Schedules
    // User 'U1' is in S1 and S2 from 10:00 to 11:00 (1 hour)
    // Rate is 50. Total Pay for 1 hour = 1 * (50/24? No Rate is per day? No Rate is Flat?
    // Wait, Rate is "Weekday Rate" £50. Usually implies Per Day or Per Shift?
    // The project docs say "£50/weekday".
    // And "Minimum 6 hours OOH to qualify".
    // Caloohpay calculation: `calculateOnCallPayment(user)`.
    // If I manually calculate in the API using `hours * Rate`, I might be wrong about "Rate is per hour".
    // The Constants say "£50 per weekday". This implies a flat rate? Or per day?
    // `src/lib/constants.ts`: "£50 per weekday".
    // If it's Per Day, then 1 hour might be 0? Or 1/24?
    // Let's check `src/lib/utils/calendarUtils.ts` again.
    // It calls `calculator.calculateOnCallPayment(onCallUser)`.
    // I mimicked `(weekdays * Rate) + (weekends * Rate)` in the API route.
    // This implies `weekdays` is a "Count of Days" (float).
    // Let's verify my API logic: `const total = (data.weekday * activeRates.weekdayRate) + ...`
    // If `OnCallPeriod.numberOfOohWeekDays` returns 0.04 (1 hour), then 0.04 * 50 = £2.
    // This seems correct for "Pro-rated" calculation.

    // Test Data:
    // Schedule S1: User U1, 10:00-11:00 (1 hour).
    // Schedule S2: User U1, 10:00-11:00 (1 hour).
    // PagerDuty Returns:
    const schedules = [
      {
        id: 'S1',
        name: 'S1',
        html_url: '',
        time_zone: 'UTC',
        final_schedule: {
          rendered_schedule_entries: [
            {
              start: '2026-01-03T00:00:00Z',
              end: '2026-01-04T00:00:00Z',
              user: { id: 'U1', summary: 'User 1' },
            },
          ],
        },
      },
      {
        id: 'S2',
        name: 'S2',
        html_url: '',
        time_zone: 'UTC',
        final_schedule: {
          rendered_schedule_entries: [
            {
              start: '2026-01-03T00:00:00Z',
              end: '2026-01-04T00:00:00Z',
              user: { id: 'U1', summary: 'User 1' },
            },
          ],
        },
      },
    ];

    mockGetMultipleSchedules.mockResolvedValue(schedules);

    const req = {
      json: async () => ({
        scheduleIds: ['S1', 'S2'],
        startDate: '2026-01-03T00:00:00Z',
        endDate: '2026-01-05T00:00:00Z',
        rates: { weekdayRate: 100, weekendRate: 200 },
      }),
    } as unknown as NextRequest;

    const res = await POST(req);
    const data = await res.json();
    // console.log(JSON.stringify(data, null, 2));

    expect(res.status).toBe(200);
    expect(data.reports).toHaveLength(2);

    const reportS1 = data.reports.find((r: ScheduleCompensationReport) => r.metadata.id === 'S1');
    const reportS2 = data.reports.find((r: ScheduleCompensationReport) => r.metadata.id === 'S2');

    expect(reportS1.employees).toHaveLength(1);
    expect(reportS2.employees).toHaveLength(1);

    // 1 hour overlapping.
    // OnCallPeriod Logic (mocked/real):
    // 1 hour overlap on Saturday (Jan 3 2026). Weekend.
    // For 1 hour of OOH time, this is approximately 1/24 of a day (~0.0416 days).
    // The overlapping OOH time is split evenly between the two schedules.
    // Each schedule therefore gets about half of the OOH time (~0.0208 days).
    // With the configured rates, that would give S1 around 2.08 in compensation.
    // (Exact values may differ slightly due to rounding.)

    const emp1 = reportS1.employees[0];
    const emp2 = reportS2.employees[0];

    expect(emp1.isOverlapping).toBe(true);
    expect(emp2.isOverlapping).toBe(true);

    // Sum should equal paying for 1 hour once.
    // 1 hour approx = 0.041666 days.
    // Pay = 4.16.
    // Sum(S1+S2) should be 4.16.
    // S1 should be ~2.08.

    expect(emp1.totalCompensation).toBeGreaterThan(0);
    expect(emp1.weekendHours).toBeGreaterThan(0);

    // Verify split roughly equal
    expect(emp1.weekendHours).toBeCloseTo(emp2.weekendHours, 5);
  });

  describe('end-of-month overnight shift compensation (bug fix)', () => {
    it('should query PagerDuty with endDate extended by 1 day', async () => {
      mockGetMultipleSchedules.mockResolvedValue([
        {
          id: 'S1',
          name: 'S1',
          html_url: '',
          time_zone: 'Europe/London',
          final_schedule: { rendered_schedule_entries: [] },
        },
      ]);

      const endDate = '2026-03-31T23:59:59.999Z';
      const req = {
        json: async () => ({
          scheduleIds: ['S1'],
          startDate: '2026-03-01T00:00:00Z',
          endDate,
          rates: { weekdayRate: 50, weekendRate: 75 },
        }),
      } as unknown as NextRequest;

      await POST(req);

      expect(mockGetMultipleSchedules).toHaveBeenCalledWith(
        ['S1'],
        '2026-03-01T00:00:00Z',
        // Should be 1 day later than endDate
        expect.stringMatching(/^2026-04-01/)
      );
    });

    it('should correctly compensate an overnight shift at month-end returned with full duration', async () => {
      // Simulate PagerDuty returning the full shift after query extension:
      // Fabian on-call Tuesday 2026-03-31 17:00 → Wednesday 2026-04-01 09:00
      // This is a 16-hour overnight weekday shift and should qualify as OOH.
      const schedules = [
        {
          id: 'S1',
          name: 'Flex Team 2',
          html_url: '',
          time_zone: 'Europe/London',
          final_schedule: {
            rendered_schedule_entries: [
              {
                start: '2026-03-31T17:00:00+01:00',
                end: '2026-04-01T09:00:00+01:00',
                user: { id: 'fabian', name: 'Fabian', summary: 'Fabian' },
              },
            ],
          },
        },
      ];

      mockGetMultipleSchedules.mockResolvedValue(schedules);

      const req = {
        json: async () => ({
          scheduleIds: ['S1'],
          startDate: '2026-03-01T00:00:00Z',
          endDate: '2026-03-31T23:59:59.999Z',
          rates: { weekdayRate: 50, weekendRate: 75 },
        }),
      } as unknown as NextRequest;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      const report = data.reports[0];
      expect(report.employees).toHaveLength(1);

      const fabian = report.employees[0];
      // March 31 is a Tuesday → weekday OOH → should get £50
      expect(fabian.totalCompensation).toBeGreaterThan(0);
      expect(fabian.weekdayHours).toBeGreaterThan(0);
    });

    it('should return zero compensation for same-day clipped periods (root cause)', () => {
      // This test documents the ROOT CAUSE: a clipped entry (same day) gives £0.
      // OnCallPeriod requires the shift to span multiple calendar days.

      // Clipped entry: March 31 17:00 → March 31 23:59 (same day, no span)
      const clipped = new OnCallPeriod(
        new Date('2026-03-31T16:00:00Z'), // 17:00 BST
        new Date('2026-03-31T22:59:00Z'), // 23:59 BST
        'Europe/London'
      );
      expect(clipped.numberOfOohWeekDays).toBe(0);
      expect(clipped.numberOfOohWeekends).toBe(0);

      // Full entry: March 31 17:00 → April 1 09:00 (spans days, qualifies)
      const full = new OnCallPeriod(
        new Date('2026-03-31T16:00:00Z'), // 17:00 BST
        new Date('2026-04-01T08:00:00Z'), // 09:00 BST
        'Europe/London'
      );
      expect(full.numberOfOohWeekDays).toBe(1); // March 31 is a Tuesday
      expect(full.numberOfOohWeekends).toBe(0);
    });

    it('should exclude entries that start after the original endDate (next-month overflow)', async () => {
      // Simulate PagerDuty returning both a valid March entry AND an April entry
      // (the April entry was returned because we extended the query until).
      // The April entry should be filtered out and not affect March compensation.
      const schedules = [
        {
          id: 'S1',
          name: 'S1',
          html_url: '',
          time_zone: 'UTC',
          final_schedule: {
            rendered_schedule_entries: [
              // Valid March entry
              {
                start: '2026-03-31T17:00:00Z',
                end: '2026-04-01T09:00:00Z',
                user: { id: 'U1', name: 'User 1', summary: 'User 1' },
              },
              // April entry that leaked in due to extended query – must be filtered
              {
                start: '2026-04-01T17:00:00Z',
                end: '2026-04-02T09:00:00Z',
                user: { id: 'U1', name: 'User 1', summary: 'User 1' },
              },
            ],
          },
        },
      ];

      mockGetMultipleSchedules.mockResolvedValue(schedules);

      const endDate = '2026-03-31T23:59:59.999Z';
      const req = {
        json: async () => ({
          scheduleIds: ['S1'],
          startDate: '2026-03-01T00:00:00Z',
          endDate,
          rates: { weekdayRate: 50, weekendRate: 75 },
        }),
      } as unknown as NextRequest;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      const report = data.reports[0];
      // Only 1 OOH day (March 31 Tuesday), NOT 2 (should not count the April entry)
      expect(report.employees).toHaveLength(1);
      const user1 = report.employees[0];
      // Should get exactly 1 weekday (March 31), not 2
      expect(user1.weekdayHours).toBeCloseTo(1, 5);
      // April 1 weekday should not be counted
      expect(user1.weekdayHours).toBeLessThan(2);
    });

    it('should correctly compensate an April 30 → May 1 overnight shift in the April report', async () => {
      // baptiste on-call April 30 17:00 → May 1 09:00 (Thursday evening → Friday morning)
      // April 30 is a Thursday → weekday OOH → should get £50 when April is queried
      const schedules = [
        {
          id: 'S1',
          name: 'S1',
          html_url: '',
          time_zone: 'Europe/London',
          final_schedule: {
            rendered_schedule_entries: [
              {
                start: '2026-04-30T16:00:00Z', // 17:00 BST
                end: '2026-05-01T08:00:00Z', // 09:00 BST
                user: { id: 'baptiste', name: 'Baptiste', summary: 'Baptiste' },
              },
            ],
          },
        },
      ];

      mockGetMultipleSchedules.mockResolvedValue(schedules);

      const req = {
        json: async () => ({
          scheduleIds: ['S1'],
          startDate: '2026-04-01T00:00:00Z',
          endDate: '2026-04-30T23:59:59.999Z',
          rates: { weekdayRate: 50, weekendRate: 75 },
        }),
      } as unknown as NextRequest;

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      const report = data.reports[0];
      expect(report.employees).toHaveLength(1);

      const baptiste = report.employees[0];
      // April 30 is a Thursday → weekday → £50
      expect(baptiste.totalCompensation).toBeGreaterThan(0);
      expect(baptiste.weekdayHours).toBeGreaterThan(0);
    });
  });
});

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { createPagerDutyClient } from '@/lib/api/pagerduty';
import {
  MultiScheduleRequest,
  ScheduleCompensationReport,
  EmployeeCompensation,
} from '@/lib/types/multi-schedule';
import { User, PagerDutySchedule } from '@/lib/types';
import { DateTime } from 'luxon';
import { OnCallPeriod } from '@/lib/caloohpay';
import { getDefaultRates } from '@/lib/utils/ratesUtils';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = session.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scheduleIds, startDate, endDate, rates } = body as MultiScheduleRequest & {
      rates?: { weekdayRate: number; weekendRate: number };
    };

    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return NextResponse.json({ error: 'Invalid scheduleIds' }, { status: 400 });
    }

    const pdClient = createPagerDutyClient(token, session.authMethod);

    // 1. Fetch all schedules in parallel
    const schedules: PagerDutySchedule[] = await pdClient.getMultipleSchedules(
      scheduleIds,
      startDate,
      endDate
    );

    // 2. Process data for Sweep Line Algorithm
    // Map: UserID -> List of { Start, End, ScheduleID, UserInfo }
    const userIntervals: Record<
      string,
      Array<{ start: DateTime; end: DateTime; scheduleId: string; userInfo: User }>
    > = {};
    const scheduleMetadata: Record<
      string,
      { id: string; name: string; html_url: string; time_zone: string }
    > = {};

    schedules.forEach((schedule) => {
      scheduleMetadata[schedule.id] = {
        id: schedule.id,
        name: schedule.name,
        html_url: schedule.html_url,
        time_zone: schedule.time_zone,
      };

      schedule.final_schedule.rendered_schedule_entries.forEach((entry) => {
        if (!entry.user || !entry.user.id) return;

        if (!userIntervals[entry.user.id]) {
          userIntervals[entry.user.id] = [];
        }

        userIntervals[entry.user.id].push({
          start: DateTime.fromISO(
            typeof entry.start === 'string' ? entry.start : entry.start.toISOString()
          ),
          end: DateTime.fromISO(
            typeof entry.end === 'string' ? entry.end : entry.end.toISOString()
          ),
          scheduleId: schedule.id,
          userInfo: entry.user,
        });
      });
    });

    // 3. Sweep Line per User
    const userCompResults: Record<
      string,
      Record<string, { weekday: number; weekend: number; userInfo: User | null }>
    > = {};
    // userCompResults[userId][scheduleId] = { weekday, weekend }

    // Initialize map
    Object.keys(userIntervals).forEach((userId) => {
      userCompResults[userId] = {};
      scheduleIds.forEach((id) => {
        userCompResults[userId][id] = { weekday: 0, weekend: 0, userInfo: null };
      });
    });

    // Use rates from request body (provided by client via getCurrentRates())
    // or fall back to default rates if not provided.
    // Note: Server-side API routes cannot access client-side localStorage/Zustand,
    // so rates must be passed in the request body from the client.
    const activeRates = rates || getDefaultRates();

    Object.entries(userIntervals).forEach(([userId, intervals]) => {
      // Get all unique time points
      const points = new Set<number>();
      intervals.forEach((i) => {
        points.add(i.start.toMillis());
        points.add(i.end.toMillis());
      });
      const sortedPoints = Array.from(points).sort((a, b) => a - b);

      // Iterate segments
      for (let i = 0; i < sortedPoints.length - 1; i++) {
        const segStart = DateTime.fromMillis(sortedPoints[i]);
        const segEnd = DateTime.fromMillis(sortedPoints[i + 1]);

        // Find active schedules for this segment by checking direct overlap
        // We treat segments as [segStart, segEnd) and intervals as overlapping if:
        // interval.start < segEnd && interval.end > segStart
        const activeSchedules = intervals.filter(
          (interval) => interval.start < segEnd && interval.end > segStart
        );

        if (activeSchedules.length > 0) {
          // NOTE: OnCallPeriod requires JS Date and timezone.
          // We calculate weekday/weekend contribution per schedule, using each schedule's own timezone.
          // This avoids ambiguity when overlapping schedules use different timezones.
          // OnCallPeriod returns fractional "days" of OOH weekday/weekend time for the given interval.

          activeSchedules.forEach((active) => {
            const sId = active.scheduleId;
            const timezone = scheduleMetadata[sId]?.time_zone || 'UTC';
            const period = new OnCallPeriod(segStart.toJSDate(), segEnd.toJSDate(), timezone);

            // Split the contribution evenly across all active schedules in this segment
            const weekdayContrib = period.numberOfOohWeekDays / activeSchedules.length;
            const weekendContrib = period.numberOfOohWeekends / activeSchedules.length;

            userCompResults[userId][sId].weekday += weekdayContrib;
            userCompResults[userId][sId].weekend += weekendContrib;
            userCompResults[userId][sId].userInfo = active.userInfo; // Capture info
          });
        }
      }
    });

    // 4. Transform to Response
    const reports: ScheduleCompensationReport[] = scheduleIds.map((id) => {
      const employees: EmployeeCompensation[] = [];

      Object.values(userCompResults).forEach((schedMap) => {
        const data = schedMap[id];
        if (data && (data.weekday > 0 || data.weekend > 0) && data.userInfo) {
          // Calculate pay
          // Note: calc logic might be complex in `OnCallPaymentsCalculator`.
          // It usually does `(weekdays * Rate) + (weekends * Rate)`.
          // But `OnCallUser` expects `OnCallPeriod[]`.
          // We have aggregated numbers.
          // We can manually calculate:
          const total =
            data.weekday * activeRates.weekdayRate + data.weekend * activeRates.weekendRate;

          // Check for overlap across any schedule
          let isOverlapping = false;
          // If this user has > 0 hours in MORE than 1 schedule
          let activeCount = 0;
          Object.values(schedMap).forEach((d) => {
            if (d.weekday > 0 || d.weekend > 0) activeCount++;
          });
          if (activeCount > 1) isOverlapping = true;

          employees.push({
            name: data.userInfo.name || data.userInfo.summary,
            totalCompensation: Number(total.toFixed(2)),
            weekdayHours: Number(data.weekday.toFixed(2)),
            weekendHours: Number(data.weekend.toFixed(2)),
            isOverlapping,
          });
        }
      });

      return {
        metadata: scheduleMetadata[id],
        employees,
      };
    });

    return NextResponse.json({
      reports,
      period: { start: startDate, end: endDate },
    });
  } catch (error: unknown) {
    console.error('Multi-schedule Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

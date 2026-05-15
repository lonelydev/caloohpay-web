import { buildCalendarDaySegments } from '@/lib/utils/calendarDaySegments';
import type { CalendarEvent } from '@/lib/utils/calendarUtils';

function createEvent(id: string, start: string, end: string): CalendarEvent {
  return {
    id,
    title: id,
    start,
    end,
    extendedProps: {
      user: {
        id: `${id}-user`,
        summary: id,
        name: id,
      },
      duration: 0,
      weekdayDays: 0,
      weekendDays: 0,
      compensation: 0,
    },
  };
}

describe('buildCalendarDaySegments', () => {
  it('renders a full-day shift as full width', () => {
    const segments = buildCalendarDaySegments(
      [createEvent('full-day', '2024-05-01T00:00:00.000Z', '2024-05-01T23:59:00.000Z')],
      'UTC'
    );

    const daySegments = segments.get('2024-05-01');
    expect(daySegments).toHaveLength(1);
    expect(daySegments?.[0].leftPercent).toBe(0);
    expect(daySegments?.[0].widthPercent).toBe(100);
    expect(daySegments?.[0].isFirstSegment).toBe(true);
    expect(daySegments?.[0].isLastSegment).toBe(true);
  });

  it('maps partial-day shifts to proportional left and width', () => {
    const segments = buildCalendarDaySegments(
      [createEvent('partial', '2024-05-01T17:00:00.000Z', '2024-05-01T23:59:00.000Z')],
      'UTC'
    );

    const daySegments = segments.get('2024-05-01');
    expect(daySegments).toHaveLength(1);

    const segment = daySegments?.[0];
    expect(segment?.leftPercent).toBeCloseTo(70.83, 1);
    expect(segment?.widthPercent).toBeCloseTo(29.17, 1);
  });

  it('renders 00:00 to 09:00 at left edge with 9-hour width', () => {
    const segments = buildCalendarDaySegments(
      [createEvent('morning', '2024-05-01T00:00:00.000Z', '2024-05-01T09:00:00.000Z')],
      'UTC'
    );

    const daySegments = segments.get('2024-05-01');
    expect(daySegments).toHaveLength(1);

    const segment = daySegments?.[0];
    expect(segment?.leftPercent).toBe(0);
    expect(segment?.widthPercent).toBeCloseTo(37.5, 2);
    expect(segment?.isFirstSegment).toBe(true);
    expect(segment?.isLastSegment).toBe(true);
  });

  it('enforces a minimum width for very short shifts', () => {
    const segments = buildCalendarDaySegments(
      [createEvent('short', '2024-05-01T23:50:00.000Z', '2024-05-01T23:55:00.000Z')],
      'UTC',
      4
    );

    const daySegments = segments.get('2024-05-01');
    expect(daySegments).toHaveLength(1);

    const segment = daySegments?.[0];
    expect(segment?.widthPercent).toBe(4);
    expect((segment?.leftPercent ?? 0) + (segment?.widthPercent ?? 0)).toBeLessThanOrEqual(100);
  });

  it('splits multi-day shifts across days with correct first/last flags', () => {
    const segments = buildCalendarDaySegments(
      [createEvent('multi', '2024-05-01T17:00:00.000Z', '2024-05-03T09:00:00.000Z')],
      'UTC'
    );

    expect(segments.get('2024-05-01')).toHaveLength(1);
    expect(segments.get('2024-05-02')).toHaveLength(1);
    expect(segments.get('2024-05-03')).toHaveLength(1);

    const day1 = segments.get('2024-05-01')?.[0];
    expect(day1?.isFirstSegment).toBe(true);
    expect(day1?.isLastSegment).toBe(false);
    // First day: starts at 17:00 (70.83% left) and extends to end of day
    expect(day1?.leftPercent).toBeCloseTo(70.83, 1);
    expect(day1?.widthPercent).toBeCloseTo(29.17, 1);

    const day2 = segments.get('2024-05-02')?.[0];
    expect(day2?.isFirstSegment).toBe(false);
    expect(day2?.isLastSegment).toBe(false);
    expect(day2?.widthPercent).toBe(100);

    const day3 = segments.get('2024-05-03')?.[0];
    expect(day3?.isFirstSegment).toBe(false);
    expect(day3?.isLastSegment).toBe(true);
    // Last day: starts at 00:00 and ends at 09:00 (37.5% width)
    expect(day3?.leftPercent).toBe(0);
    expect(day3?.widthPercent).toBeCloseTo(37.5, 1);
  });

  it('places non-overlapping shifts on the same row', () => {
    // 09:00-10:00 and 11:00-12:00 do not overlap → both rowIndex 0
    const segments = buildCalendarDaySegments(
      [
        createEvent('b', '2024-05-01T11:00:00.000Z', '2024-05-01T12:00:00.000Z'),
        createEvent('a', '2024-05-01T09:00:00.000Z', '2024-05-01T10:00:00.000Z'),
      ],
      'UTC'
    );

    const daySegments = segments.get('2024-05-01');
    expect(daySegments).toHaveLength(2);
    // Both segments are non-overlapping → same row
    expect(daySegments?.[0].rowIndex).toBe(0);
    expect(daySegments?.[1].rowIndex).toBe(0);
    expect((daySegments?.[0].startMinute ?? 0) < (daySegments?.[1].startMinute ?? 0)).toBe(true);
  });

  it('stacks overlapping shifts in separate rows', () => {
    // 09:00-18:00 and 12:00-22:00 overlap → rowIndex 0 and 1
    const segments = buildCalendarDaySegments(
      [
        createEvent('morning', '2024-05-01T09:00:00.000Z', '2024-05-01T18:00:00.000Z'),
        createEvent('afternoon', '2024-05-01T12:00:00.000Z', '2024-05-01T22:00:00.000Z'),
      ],
      'UTC'
    );

    const daySegments = segments.get('2024-05-01');
    expect(daySegments).toHaveLength(2);
    const rows = (daySegments ?? []).map((s) => s.rowIndex).sort((a, b) => a - b);
    expect(rows).toEqual([0, 1]);
  });
});

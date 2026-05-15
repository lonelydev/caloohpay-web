import { DateTime } from 'luxon';
import type { CalendarEvent } from '@/lib/utils/calendarUtils';

const MINUTES_IN_DAY = 1440;

export interface CalendarDaySegment {
  segmentId: string;
  eventId: string;
  dateKey: string;
  rowIndex: number;
  title: string;
  leftPercent: number;
  widthPercent: number;
  startMinute: number;
  endMinute: number;
  /** True only for the first calendar day of the originating shift */
  isFirstSegment: boolean;
  /** True only for the last calendar day of the originating shift */
  isLastSegment: boolean;
  /** Total compensation for the originating shift (used for bar label) */
  compensation: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

function toPercentage(value: number): number {
  return Number(value.toFixed(2));
}

export function buildCalendarDaySegments(
  events: CalendarEvent[],
  timezone: string,
  minVisibleWidthPercent = 4
): Map<string, CalendarDaySegment[]> {
  const segmentsByDate = new Map<string, CalendarDaySegment[]>();

  for (const event of events) {
    const eventStart = DateTime.fromISO(event.start, { zone: timezone });
    const eventEnd = DateTime.fromISO(event.end, { zone: timezone });

    if (!eventStart.isValid || !eventEnd.isValid || eventEnd <= eventStart) {
      continue;
    }

    let currentDay = eventStart.startOf('day');
    const lastDay = eventEnd.startOf('day');

    while (currentDay <= lastDay) {
      const dayStart = currentDay;
      const dayEnd = dayStart.plus({ days: 1 });
      const segmentStart = eventStart > dayStart ? eventStart : dayStart;
      const segmentEnd = eventEnd < dayEnd ? eventEnd : dayEnd;

      if (segmentEnd <= segmentStart) {
        currentDay = currentDay.plus({ days: 1 });
        continue;
      }

      const dateKey = dayStart.toISODate();
      if (!dateKey) {
        currentDay = currentDay.plus({ days: 1 });
        continue;
      }

      const startMinute = Math.max(0, segmentStart.diff(dayStart, 'minutes').minutes);
      const rawEndMinute = Math.min(
        MINUTES_IN_DAY,
        Math.max(0, segmentEnd.diff(dayStart, 'minutes').minutes)
      );

      // Treat 23:59 as a full-day ending for display so full-day shifts fill the whole width.
      const endMinute = rawEndMinute >= MINUTES_IN_DAY - 1 ? MINUTES_IN_DAY : rawEndMinute;
      const rawWidthPercent = ((endMinute - startMinute) / MINUTES_IN_DAY) * 100;
      const widthPercent = Math.min(100, Math.max(rawWidthPercent, minVisibleWidthPercent));
      const unclampedLeftPercent = (startMinute / MINUTES_IN_DAY) * 100;
      const leftPercent = Math.max(0, Math.min(100 - widthPercent, unclampedLeftPercent));

      const isFirstSegment = currentDay.toISODate() === eventStart.startOf('day').toISODate();
      const isLastSegment = eventEnd <= dayEnd;

      const daySegments = segmentsByDate.get(dateKey) ?? [];
      daySegments.push({
        segmentId: `${event.id}-${dateKey}`,
        eventId: event.id,
        dateKey,
        rowIndex: 0,
        title: event.title,
        leftPercent: toPercentage(leftPercent),
        widthPercent: toPercentage(widthPercent),
        startMinute: Number(startMinute.toFixed(2)),
        endMinute: Number(endMinute.toFixed(2)),
        isFirstSegment,
        isLastSegment,
        compensation: event.extendedProps.compensation,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
      });

      segmentsByDate.set(dateKey, daySegments);
      currentDay = currentDay.plus({ days: 1 });
    }
  }

  for (const [dateKey, daySegments] of segmentsByDate.entries()) {
    const sorted = [...daySegments].sort((a, b) => {
      if (a.startMinute === b.startMinute) {
        return b.endMinute - a.endMinute;
      }
      return a.startMinute - b.startMinute;
    });

    // Interval-scheduling: assign the lowest row whose last segment already ended
    // before this one starts.  Non-overlapping segments share the same row.
    const rowEnds: number[] = [];
    const withRows = sorted.map((segment) => {
      const available = rowEnds.findIndex((endMin) => endMin <= segment.startMinute);
      const assignedRow = available === -1 ? rowEnds.length : available;
      rowEnds[assignedRow] = segment.endMinute;
      return { ...segment, rowIndex: assignedRow };
    });

    segmentsByDate.set(dateKey, withRows);
  }

  return segmentsByDate;
}

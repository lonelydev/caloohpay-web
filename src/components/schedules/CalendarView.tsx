/**
 * CalendarView Component
 * Displays on-call schedules in a monthly calendar format with FullCalendar
 * Includes interactive event cards showing compensation details
 */

'use client';

import { useCallback, useState, useMemo, memo } from 'react';
import { useTheme } from '@mui/material/styles';
import * as styles from './CalendarView.styles';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { Wallet, AccessTime, Work, WorkOff, Person } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import luxon3Plugin from '@fullcalendar/luxon3';
import type { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import { DateTime } from 'luxon';
import { PAYMENT_RATES } from '@/lib/constants';
import type { CalendarEvent } from '@/lib/utils/calendarUtils';
import { buildCalendarDaySegments } from '@/lib/utils/calendarDaySegments';

interface CalendarViewProps {
  events: CalendarEvent[];
  timezone: string;
  initialDate?: string; // ISO string for the current month to display
}

/**
 * Memoized event detail dialog - only re-renders when selected event changes
 */
const EventDetailDialog = memo<{
  event: CalendarEvent | null;
  timezone: string;
  open: boolean;
  onClose: () => void;
}>(({ event, timezone, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!event) return null;

  const startDateTime = DateTime.fromISO(event.start, { zone: timezone });
  const endDateTime = DateTime.fromISO(event.end, { zone: timezone });

  if (!startDateTime.isValid || !endDateTime.isValid) {
    console.error('Invalid date format in calendar event:', {
      event,
      start: event.start,
      end: event.end,
    });
    return null;
  }
  const { user, duration, weekdayDays, weekendDays, compensation } = event.extendedProps;

  const weekdayPayment = weekdayDays * PAYMENT_RATES.WEEKDAY;
  const weekendPayment = weekendDays * PAYMENT_RATES.WEEKEND;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="event-detail-dialog-title"
    >
      <DialogTitle id="event-detail-dialog-title">
        <Box sx={styles.dialogHeaderBox}>
          <Person color="primary" />
          <Typography variant="h6" component="span">
            {user.name || user.summary}
          </Typography>
        </Box>
        {user.email && (
          <Typography variant="body2" color="text.secondary" sx={styles.dialogEmailText}>
            {user.email}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Time Period */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              On-Call Period
            </Typography>
            <Box sx={styles.timePeriodBorder}>
              <Typography variant="body1" gutterBottom>
                <Typography component="span" color="text.secondary">
                  From:{' '}
                </Typography>
                <Typography component="span" fontWeight="medium">
                  {startDateTime.toFormat('EEE yyyy/MM/dd, HH:mm ZZZ')}
                </Typography>
              </Typography>
              <Typography variant="body1">
                <Typography component="span" color="text.secondary">
                  To:{' '}
                </Typography>
                <Typography component="span" fontWeight="medium">
                  {endDateTime.toFormat('EEE yyyy/MM/dd, HH:mm ZZZ')}
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Duration and Days */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Duration & Coverage
            </Typography>
            <Box sx={styles.chipsContainer}>
              <Chip
                icon={<AccessTime />}
                label={`${duration.toFixed(1)} hours total`}
                color="primary"
                variant="outlined"
              />
              {weekdayDays > 0 && (
                <Chip
                  icon={<Work />}
                  label={`${weekdayDays} weekday${weekdayDays > 1 ? 's' : ''}`}
                  color="default"
                  variant="outlined"
                />
              )}
              {weekendDays > 0 && (
                <Chip
                  icon={<WorkOff />}
                  label={`${weekendDays} weekend${weekendDays > 1 ? 's' : ''}`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Divider />

          {/* Compensation Breakdown */}
          <Box sx={styles.compensationBox}>
            <Typography
              variant="caption"
              sx={styles.compensationTitle}
              display="block"
              gutterBottom
              fontWeight="bold"
            >
              PAYMENT CALCULATION
            </Typography>

            <Stack spacing={1}>
              {weekdayDays > 0 && (
                <Box sx={styles.paymentRow}>
                  <Typography variant="body2">
                    {weekdayDays} weekday{weekdayDays > 1 ? 's' : ''} ×{' '}
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {PAYMENT_RATES.WEEKDAY}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {weekdayPayment.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {weekendDays > 0 && (
                <Box sx={styles.paymentRow}>
                  <Typography variant="body2">
                    {weekendDays} weekend{weekendDays > 1 ? 's' : ''} ×{' '}
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {PAYMENT_RATES.WEEKEND}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {weekendPayment.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={styles.compensationDivider} />

              <Box sx={styles.totalRow}>
                <Typography variant="h6" sx={styles.totalLabel}>
                  <Wallet /> Total Compensation
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {PAYMENT_RATES.CURRENCY_SYMBOL}
                  {compensation.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});
EventDetailDialog.displayName = 'EventDetailDialog';

/**
 * Main calendar view component
 * Renders on-call schedules in a monthly calendar with FullCalendar
 * Navigation is handled externally via the parent component
 */
export default function CalendarView({ events, timezone, initialDate }: CalendarViewProps) {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Individual bar clicks open the dialog directly; this handles clicks on the
  // transparent event area outside any bar (e.g. keyboard activation).
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      clickInfo.jsEvent.preventDefault();
      const segs = clickInfo.event.extendedProps?.segments as
        | import('@/lib/utils/calendarDaySegments').CalendarDaySegment[]
        | undefined;
      const firstSegment = segs?.[0];
      if (firstSegment) {
        const fullEvent = events.find((e) => e.id === firstSegment.eventId);
        if (fullEvent) setSelectedEvent(fullEvent);
      }
    },
    [events]
  );

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Open dialog for a specific on-call event (called from bar onClick)
  const handleBarClick = useCallback(
    (eventId: string) => {
      const fullEvent = events.find((e) => e.id === eventId);
      if (fullEvent) setSelectedEvent(fullEvent);
    },
    [events]
  );

  const daySegmentsByDate = useMemo(
    () => buildCalendarDaySegments(events, timezone),
    [events, timezone]
  );

  // One synthetic FC event per non-overlapping track per day.
  // Segments sharing the same rowIndex (non-overlapping in time) go into the same
  // FC event so FullCalendar allocates only one row for them, preventing false stacking.
  const syntheticFcEvents = useMemo<EventInput[]>(() => {
    const result: EventInput[] = [];
    for (const [dateKey, segments] of daySegmentsByDate.entries()) {
      const endDate = DateTime.fromISO(dateKey).plus({ days: 1 }).toISODate();
      // Group segments by rowIndex (each row = one non-overlapping track)
      const trackMap = new Map<number, typeof segments>();
      for (const segment of segments) {
        const track = trackMap.get(segment.rowIndex) ?? [];
        track.push(segment);
        trackMap.set(segment.rowIndex, track);
      }
      for (const [rowIndex, trackSegments] of trackMap.entries()) {
        result.push({
          id: `track-${dateKey}-${rowIndex}`,
          start: dateKey,
          end: endDate ?? undefined,
          allDay: true,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          extendedProps: { segments: trackSegments },
        });
      }
    }
    return result;
  }, [daySegmentsByDate]);

  const renderEventContent = useCallback(
    (arg: EventContentArg) => {
      const segments = arg.event.extendedProps?.segments as
        | import('@/lib/utils/calendarDaySegments').CalendarDaySegment[]
        | undefined;
      if (!segments || segments.length === 0) return null;

      return (
        <div className="cop-segment-outer">
          {segments.map((segment) => {
            const r = '7px';
            const borderRadius = (() => {
              if (segment.isFirstSegment && segment.isLastSegment) return r;
              if (segment.isFirstSegment) return `${r} 0 0 ${r}`;
              if (segment.isLastSegment) return `0 ${r} ${r} 0`;
              return '0';
            })();

            const showLabel = segment.widthPercent >= 15;
            const label = showLabel
              ? `${segment.title}${
                  segment.compensation > 0 ? ` £${segment.compensation.toFixed(0)}` : ''
                }`
              : '';

            const startH = Math.floor(segment.startMinute / 60)
              .toString()
              .padStart(2, '0');
            const startM = Math.floor(segment.startMinute % 60)
              .toString()
              .padStart(2, '0');
            const endH = Math.floor(segment.endMinute / 60)
              .toString()
              .padStart(2, '0');
            const endM = Math.floor(segment.endMinute % 60)
              .toString()
              .padStart(2, '0');
            const tooltip = `${segment.title} • ${startH}:${startM}–${endH}:${endM} • £${segment.compensation.toFixed(0)}`;

            return (
              <button
                key={segment.segmentId}
                type="button"
                className="cop-segment-bar"
                data-testid={`day-segment-${segment.segmentId}`}
                data-left-percent={segment.leftPercent}
                data-width-percent={segment.widthPercent}
                data-row-index={segment.rowIndex}
                title={tooltip}
                aria-label={tooltip}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBarClick(segment.eventId);
                }}
                style={{
                  left: `${segment.leftPercent}%`,
                  width: `${segment.widthPercent}%`,
                  backgroundColor: segment.backgroundColor,
                  color: segment.textColor,
                  borderRadius,
                }}
              >
                {showLabel && <span className="cop-segment-label">{label}</span>}
              </button>
            );
          })}
        </div>
      );
    },
    [handleBarClick]
  );

  // Memoize calendar styling to prevent unnecessary re-renders
  const calendarStyles = useMemo(() => styles.getCalendarStyles(theme), [theme]);

  return (
    <>
      <Box sx={calendarStyles}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, luxon3Plugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: '',
            center: 'title',
            right: '',
          }}
          timeZone={timezone}
          initialDate={initialDate}
          events={syntheticFcEvents}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          displayEventTime={false}
          validRange={
            initialDate
              ? (() => {
                  const start = DateTime.fromISO(initialDate, { zone: timezone })
                    .startOf('month')
                    .toISO();
                  const end = DateTime.fromISO(initialDate, { zone: timezone })
                    .endOf('month')
                    .toISO();
                  return start && end ? { start, end } : undefined;
                })()
              : undefined
          }
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkText="more"
          moreLinkClick="popover"
          fixedWeekCount={false}
          showNonCurrentDates={false}
        />
      </Box>

      <EventDetailDialog
        event={selectedEvent}
        timezone={timezone}
        open={!!selectedEvent}
        onClose={handleCloseDialog}
      />
    </>
  );
}
